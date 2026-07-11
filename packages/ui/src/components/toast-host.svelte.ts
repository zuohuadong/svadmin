export interface ToastHostRegistration {
  isActive(): boolean;
  unregister(): void;
}

let hostIds = $state.raw<symbol[]>([]);

export function registerToastHost(): ToastHostRegistration {
  if (typeof window === 'undefined') {
    return {
      isActive: () => false,
      unregister: () => undefined,
    };
  }

  const id = Symbol('svadmin-toast-host');
  let registered = true;
  hostIds = [...hostIds, id];

  return {
    isActive: () => hostIds[0] === id,
    unregister: () => {
      if (!registered) return;
      registered = false;
      hostIds = hostIds.filter((hostId) => hostId !== id);
    },
  };
}
