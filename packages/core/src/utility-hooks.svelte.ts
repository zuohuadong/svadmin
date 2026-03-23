import { useForm, type UseFormOptions } from './form-hooks.svelte';
import { useQueryClient } from '@tanstack/svelte-query';
import { useParsed } from './useParsed';
import { getResource, getResources } from './context';
import { getAdminOptions } from './options';
import { navigate } from './router';
import { t } from './i18n.svelte';
import type { BaseRecord, HttpError, Filter, KnownResources, ResourceDefinition } from './types';
import { useList, type UseListOptions } from './query-hooks.svelte';
import { toast } from './toast.svelte';

// ─── useModal ─────────────────────────────────────────────────
export function useModal(options?: { defaultVisible?: boolean }) {
  let visible = $state(options?.defaultVisible ?? false);
  return {
    get visible() { return visible; },
    show() { visible = true; },
    close() { visible = false; },
  };
}

// ─── useModalForm ─────────────────────────────────────────────

export interface UseModalFormOptions<TQueryFnData extends BaseRecord = BaseRecord, TError = HttpError, TVariables = Record<string, unknown>, TData extends BaseRecord = TQueryFnData> extends UseFormOptions<TQueryFnData, TError, TVariables, TData> {
  defaultVisible?: boolean;
  autoSave?: UseFormOptions<TQueryFnData, TError, TVariables, TData>['autoSave'] & {
    invalidateOnClose?: boolean;
  };
}

export function useModalForm<
  TQueryFnData extends BaseRecord = BaseRecord,
  TError = HttpError,
  TVariables = Record<string, unknown>,
  TData extends BaseRecord = TQueryFnData
>(options: UseModalFormOptions<TQueryFnData, TError, TVariables, TData> = {}) {
  const queryClient = useQueryClient();
  const formState = useForm(options);
  let visible = $state(options.defaultVisible ?? false);

  function show(id?: string | number) {
    if (id !== undefined) formState.setId(id);
    visible = true;
  }

  function close() {
    visible = false;
    formState.clearErrors();
    if (options.autoSave?.invalidateOnClose) {
      queryClient.invalidateQueries({ queryKey: [formState.resource] });
    }
  }

  return {
    get visible() { return visible; },
    show,
    close,
    get modalProps() { return { visible, close }; },
    formState,
  };
}

export const useDrawerForm = useModalForm; // Alias for UI variations

// ─── useMenu ──────────────────────────────────────────────────

export interface MenuConfig {
  name: string;
  route: string;
  label: string;
  icon?: string;
  parentName?: string;
  order?: number;
}

export function useMenu() {
  const adminOptions = getAdminOptions();
  const resources = getResources();
  const parsed = useParsed();

  const menuItems = $derived.by<MenuConfig[]>(() => {
    let items: MenuConfig[] = resources
      .filter((r: ResourceDefinition) => r.showInMenu !== false)
      .map((r: ResourceDefinition): MenuConfig => ({
        name: r.name,
        route: `/${r.name}`,
        label: r.label || r.name, // Usually handled by i18n label mapping
        icon: r.icon,
        parentName: r.parentName,
        order: r.menuOrder ?? 999,
      }));

    if (adminOptions.menuItems) items = adminOptions.menuItems(items);
    items.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    return items;
  });

  return {
    get menuItems() { return menuItems; },
    get selectedKey() { return parsed.resource ?? '/'; },
  };
}

// ─── useBreadcrumb ────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

export function useBreadcrumb() {
  const parsed = useParsed();
  
  const items = $derived.by<BreadcrumbItem[]>(() => {
    const list: BreadcrumbItem[] = [];
    if (!parsed.resource) return list;

    try {
      const res = getResource(parsed.resource);
      list.push({ label: res.label || res.name, link: `/${res.name}`, icon: res.icon });

      if (parsed.action === 'create') {
        list.push({ label: t('common.create') });
      } else if (parsed.action === 'edit' && parsed.id) {
        list.push({ label: t('common.edit') });
        list.push({ label: String(parsed.id) });
      } else if (parsed.action === 'show' && parsed.id) {
        list.push({ label: t('common.show') });
        list.push({ label: String(parsed.id) });
      }
    } catch {
      // Ignored
    }
    return list;
  });

  return { get items() { return items; } };
}

// ─── useRelation ───────────────────────────────────────────

export interface UseRelationOptions<TData extends BaseRecord = BaseRecord, TError = HttpError> {
  resource: KnownResources;
  id?: string | number;
  pagination?: { current?: number; pageSize?: number };
  sorters?: { field: string; order: 'asc' | 'desc' }[];
  filters?: Filter[];
  queryOptions?: { enabled?: boolean; staleTime?: number };
}

export function useRelation<TData extends BaseRecord = BaseRecord, TError = HttpError>(options: UseRelationOptions<TData, TError>) {
  return useList<TData, TError>({
    ...options
  });
}

// ─── useNotification ────────────────────────────────────────
export function useNotification() {
  return { open: toast.info, success: toast.success, error: toast.error, warning: toast.warning };
}
