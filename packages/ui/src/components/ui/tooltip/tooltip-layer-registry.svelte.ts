export type TooltipLayerBehavior =
	| 'close'
	| 'defer-otherwise-close'
	| 'defer-otherwise-ignore'
	| 'ignore';

export type TooltipLayerRegistration = {
	containsTarget: (target: EventTarget | null) => boolean;
	getInteractOutsideBehavior: () => TooltipLayerBehavior;
	getEscapeKeydownBehavior: () => TooltipLayerBehavior;
	onInteractOutside: (event: PointerEvent) => void;
	onFocusOutside: (event: FocusEvent) => void;
	onEscapeKeydown: (event: KeyboardEvent) => void;
	close: () => void;
};

type BehaviorReader = (layer: TooltipLayerRegistration) => TooltipLayerBehavior;

class TooltipLayerRegistry {
	#layers: TooltipLayerRegistration[] = [];
	#listening = false;

	constructor(readonly ownerDocument: Document) {}

	register(layer: TooltipLayerRegistration) {
		this.#layers = [...this.#layers, layer];
		this.#ensureListeners();
		return () => {
			this.#layers = this.#layers.filter((candidate) => candidate !== layer);
			if (this.#layers.length === 0) this.#removeListeners();
		};
	}

	#ensureListeners() {
		if (this.#listening) return;
		this.#listening = true;
		this.ownerDocument.addEventListener('pointerdown', this.#handlePointerDown, true);
		this.ownerDocument.addEventListener('focusin', this.#handleFocusIn, true);
		this.ownerDocument.defaultView?.addEventListener('keydown', this.#handleKeydown, true);
	}

	#removeListeners() {
		if (!this.#listening) return;
		this.#listening = false;
		this.ownerDocument.removeEventListener('pointerdown', this.#handlePointerDown, true);
		this.ownerDocument.removeEventListener('focusin', this.#handleFocusIn, true);
		this.ownerDocument.defaultView?.removeEventListener('keydown', this.#handleKeydown, true);
	}

	#handlePointerDown = (event: PointerEvent) => {
		if (this.#layers.some((candidate) => candidate.containsTarget(event.target))) return;

		const layer = this.#getResponsibleLayer((candidate) =>
			candidate.getInteractOutsideBehavior()
		);
		if (!layer) return;

		const behavior = layer.getInteractOutsideBehavior();
		if (behavior !== 'close' && behavior !== 'defer-otherwise-close') return;
		layer.onInteractOutside(event);
		if (!event.defaultPrevented) layer.close();
	};

	#handleFocusIn = (event: FocusEvent) => {
		for (const layer of [...this.#layers]) {
			if (!layer.containsTarget(event.target)) layer.onFocusOutside(event);
		}
	};

	#handleKeydown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') return;
		const layer = this.#getResponsibleLayer((candidate) =>
			candidate.getEscapeKeydownBehavior()
		);
		if (!layer) return;

		const behavior = layer.getEscapeKeydownBehavior();
		if (behavior !== 'close' && behavior !== 'defer-otherwise-close') {
			event.preventDefault();
			return;
		}

		const KeyboardEventConstructor = this.ownerDocument.defaultView?.KeyboardEvent;
		const callbackEvent = KeyboardEventConstructor
			? new KeyboardEventConstructor(event.type, event)
			: event;
		layer.onEscapeKeydown(callbackEvent);
		const callbackPrevented = callbackEvent.defaultPrevented;
		event.preventDefault();
		if (!callbackPrevented) layer.close();
	};

	#getResponsibleLayer(readBehavior: BehaviorReader) {
		for (let index = this.#layers.length - 1; index >= 0; index -= 1) {
			const layer = this.#layers[index];
			if (!layer) continue;
			const behavior = readBehavior(layer);
			if (behavior === 'close' || behavior === 'ignore') return layer;
		}
		return this.#layers[0];
	}
}

const registries = new WeakMap<Document, TooltipLayerRegistry>();

export function registerTooltipLayer(
	ownerDocument: Document,
	layer: TooltipLayerRegistration
) {
	let registry = registries.get(ownerDocument);
	if (!registry) {
		registry = new TooltipLayerRegistry(ownerDocument);
		registries.set(ownerDocument, registry);
	}
	return registry.register(layer);
}
