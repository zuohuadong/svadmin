import Root from "./tooltip.svelte";
import Trigger from "./tooltip-trigger.svelte";
import Content from "./tooltip-content.svelte";
import Provider from "./tooltip-provider.svelte";
import Portal from "./tooltip-portal.svelte";
import { Tooltip as TooltipPrimitive } from "bits-ui";

const createTether = TooltipPrimitive.createTether;
type Tether<Payload = never> = TooltipPrimitive.Tether<Payload>;

export {
	Root,
	Trigger,
	Content,
	Provider,
	Portal,
	createTether,
	type Tether,
	//
	Root as Tooltip,
	Content as TooltipContent,
	Trigger as TooltipTrigger,
	Provider as TooltipProvider,
	Portal as TooltipPortal,
};
