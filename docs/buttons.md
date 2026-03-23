# CRUD Buttons

Standalone navigation and action buttons for resource CRUD operations. Each button handles routing, access control, and i18n automatically.

## Common Props

All buttons share these optional props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resource` | `string` | — | Resource name |
| `hideText` | `boolean` | `false` | Show icon only |
| `class` | `string` | `''` | Additional CSS classes |
| `accessControl` | `{ enabled?, hideIfUnauthorized? }` | — | Permission checks |

## Buttons

### CreateButton

Navigate to the create page for a resource.

```svelte
<CreateButton resource="posts" />
<CreateButton resource="posts" hideText />
<CreateButton resource="posts" accessControl={{ enabled: true, hideIfUnauthorized: true }} />
```

### EditButton

Navigate to the edit page for a specific record.

```svelte
<EditButton resource="posts" recordItemId={42} />
```

### DeleteButton

Delete a record with inline confirmation.

```svelte
<DeleteButton resource="posts" recordItemId={42} />
<DeleteButton resource="posts" recordItemId={42} undoable />
<DeleteButton resource="posts" recordItemId={42} onSuccess={() => console.log('deleted')} />
```

### ShowButton

Navigate to the detail/show page for a record.

```svelte
<ShowButton resource="posts" recordItemId={42} />
```

### ListButton

Navigate back to the list page for a resource.

```svelte
<ListButton resource="posts" />
```

### RefreshButton

Invalidate the TanStack Query cache for a resource (re-fetch data).

```svelte
<RefreshButton resource="posts" />
```

### ExportButton

Export all records to CSV using the built-in `useExport` hook.

```svelte
<ExportButton resource="posts" />
```

### ImportButton

Import records from a CSV file.

```svelte
<ImportButton resource="posts" onComplete={({ success, failed }) => console.log(success, failed)} />
```

### SaveButton

Submit a form. Shows a loading spinner while saving.

```svelte
<SaveButton />
<SaveButton loading={true} />
<SaveButton type="button" />
```

### CloneButton

Navigate to the create page with data prefilled from an existing record.

```svelte
<CloneButton resource="posts" recordItemId={42} />
```

## Access Control

Buttons integrate with the permission system:

```svelte
<CreateButton
  resource="posts"
  accessControl={{
    enabled: true,
    hideIfUnauthorized: true  // hides button if user lacks permission
  }}
/>
```
