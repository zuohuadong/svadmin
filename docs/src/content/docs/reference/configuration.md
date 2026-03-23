---
title: Configuration
description: Complete configuration reference for svadmin
---

## AdminApp Props

| Prop | Type | Required | Default |
|------|------|----------|---------|
| `dataProvider` | `DataProvider \| Record<string, DataProvider>` | ✅ | — |
| `authProvider` | `AuthProvider` | — | — |
| `resources` | `ResourceDefinition[]` | ✅ | — |
| `routerProvider` | `RouterProvider` | — | Hash router |
| `title` | `string` | — | `'Admin'` |
| `colorTheme` | `ColorTheme` | — | `'blue'` |

## Resource Definition

```typescript
interface ResourceDefinition {
  name: string;               // URL segment (e.g. 'posts')
  label: string;              // Display name (e.g. 'Blog Posts')
  icon?: string;              // Sidebar icon
  primaryKey?: string;        // Default: 'id'
  fields: FieldDefinition[];
  defaultSort?: Sort;
  pageSize?: number;          // Default: 10
  canCreate?: boolean;        // Default: true
  canEdit?: boolean;
  canDelete?: boolean;
  canShow?: boolean;
  meta?: Record<string, unknown> & {
    dataProviderName?: string;  // For multi-provider setups
  };
}
```

## Field Definition

```typescript
interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect'
    | 'tags' | 'textarea' | 'richtext' | 'image' | 'images' | 'json'
    | 'relation' | 'color' | 'url' | 'email' | 'phone';
  required?: boolean;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  showInList?: boolean;
  showInForm?: boolean;
  showInCreate?: boolean;
  showInEdit?: boolean;
  showInShow?: boolean;
  options?: { label: string; value: string | number }[];
  defaultValue?: unknown;
  resource?: string;       // Related resource (relations)
  optionLabel?: string;
  optionValue?: string;
  validate?: (value: unknown) => string | null;
}
```

## Color Themes

Available: `blue`, `green`, `purple`, `orange`, `rose`, `teal`, `slate`

```typescript
<AdminApp colorTheme="purple" ... />
```
