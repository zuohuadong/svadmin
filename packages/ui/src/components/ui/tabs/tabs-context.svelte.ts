import { createContext } from 'svelte';

export interface TabsContextValue {
	readonly value: string;
	select: (value: string) => void;
}

export const [getTabsContext, setTabsContext] = createContext<TabsContextValue>();
