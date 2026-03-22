# AutoTable

> Auto-generated CRUD table / 自动 CRUD 表格

## Import

```typescript
import { AutoTable } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<!-- As part of AdminApp (automatic) -->
<!-- AdminApp routes to AutoTable at #/:resource -->

<!-- Standalone / 独立使用 -->
<AutoTable resourceName="posts" />
```

## Props

| Prop | Type | Required | Description / 描述 |
|------|------|----------|-------------------|
| `resourceName` | `string` | ✅ | Resource name from definitions / 资源名称 |

## Features / 功能

- ✅ Server-side pagination / 服务端分页
- ✅ Column sorting / 列排序
- ✅ Search filtering / 搜索过滤
- ✅ Batch selection / 批量选择
- ✅ Create / Edit / Show / Delete actions / CRUD 操作
- ✅ URL state sync / URL 状态同步
- ✅ Permission-based action visibility / 权限控制
- ✅ CSV export / CSV 导出

---

# AutoForm

> Auto-generated create/edit form / 自动创建/编辑表单

## Import

```typescript
import { AutoForm } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<!-- Create mode / 创建模式 -->
<AutoForm resourceName="posts" action="create" />

<!-- Edit mode / 编辑模式 -->
<AutoForm resourceName="posts" action="edit" id="1" />
```

## Props

| Prop | Type | Required | Description / 描述 |
|------|------|----------|-------------------|
| `resourceName` | `string` | ✅ | Resource name / 资源名称 |
| `action` | `'create' \| 'edit'` | ✅ | Form action / 表单操作 |
| `id` | `string` | edit only | Record ID for edit / 编辑记录 ID |

## Supported Field Types / 支持字段类型

| Type | Renders / 渲染 |
|------|---------------|
| `text` | Input |
| `number` | Number input |
| `email` | Email input |
| `url` | URL input |
| `phone` | Phone input |
| `textarea` | Textarea |
| `select` | Select dropdown |
| `boolean` | Checkbox |
| `date` | Date input |
| `datetime` | Datetime input |
| `rich-text` | Textarea (fallback) |

---

# ShowPage

> Record detail page / 记录详情页

## Import

```typescript
import { ShowPage } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<ShowPage resourceName="posts" id="1" />
```

## Props

| Prop | Type | Required | Description / 描述 |
|------|------|----------|-------------------|
| `resourceName` | `string` | ✅ | Resource name / 资源名称 |
| `id` | `string` | ✅ | Record ID / 记录 ID |
