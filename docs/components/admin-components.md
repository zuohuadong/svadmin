# EmptyState

> Empty data placeholder / 空数据占位组件

## Import

```typescript
import { EmptyState } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<!-- Basic / 基础 -->
<EmptyState />

<!-- Custom / 自定义 -->
<EmptyState
  title="No posts found"
  description="Create your first post to get started."
>
  {#snippet action()}
    <Button onclick={() => navigate('/posts/create')}>Create Post</Button>
  {/snippet}
</EmptyState>

<!-- Custom icon / 自定义图标 -->
<EmptyState icon={SearchX} title="No results" description="Try a different search term." />
```

## Props

| Prop | Type | Default | Description / 描述 |
|------|------|---------|-------------------|
| `icon` | `Component` | `InboxIcon` | Icon component / 图标组件 |
| `title` | `string` | `t('common.noData')` | Title text / 标题 |
| `description` | `string` | — | Description text / 描述 |
| `action` | `Snippet` | — | Action buttons slot / 操作按钮插槽 |
| `class` | `string` | — | Additional CSS classes / 额外样式 |

# StatsCard

> Dashboard statistics card / 仪表盘统计卡片

## Import

```typescript
import { StatsCard } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<StatsCard label="Total Users" value={1234} icon={Users} />

<!-- With trend / 带趋势 -->
<StatsCard
  label="Revenue"
  value="$12,345"
  icon={DollarSign}
  trend={{ value: 12.5, label: "vs last month" }}
/>

<!-- Loading / 加载中 -->
<StatsCard label="Orders" value={0} loading={true} />
```

## Props

| Prop | Type | Default | Description / 描述 |
|------|------|---------|-------------------|
| `label` | `string` | **required** | Stat label / 统计标签 |
| `value` | `string \| number` | **required** | Stat value / 统计值 |
| `icon` | `Component` | — | Icon component / 图标 |
| `trend` | `{ value: number; label?: string }` | — | Trend indicator / 趋势指标 |
| `loading` | `boolean` | `false` | Loading state / 加载状态 |
| `class` | `string` | — | Additional CSS classes / 额外样式 |

# PageHeader

> Page title with breadcrumbs and actions / 带面包屑和操作按钮的页面标题

## Import

```typescript
import { PageHeader } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<PageHeader title="Posts" description="Manage your blog posts" />

<!-- With actions / 带操作按钮 -->
<PageHeader title="Users">
  {#snippet actions()}
    <Button>Export</Button>
    <Button variant="default">Add User</Button>
  {/snippet}
</PageHeader>
```

## Props

| Prop | Type | Default | Description / 描述 |
|------|------|---------|-------------------|
| `title` | `string` | **required** | Page title / 页面标题 |
| `description` | `string` | — | Subtitle / 副标题 |
| `actions` | `Snippet` | — | Action buttons / 操作按钮 |
| `showBreadcrumbs` | `boolean` | `true` | Show breadcrumbs / 显示面包屑 |
| `class` | `string` | — | Additional CSS classes / 额外样式 |

# Header

> Top navigation bar / 顶部导航栏

## Import

```typescript
import { Header } from '@svadmin/ui';
```

## Usage / 用法

```svelte
<Header title="Dashboard" identity={currentUser} />

<!-- With search and actions / 带搜索和操作 -->
<Header title="Admin" showSearch={true}>
  {#snippet actions()}
    <Button variant="ghost" size="icon-sm">
      <Bell class="h-4 w-4" />
    </Button>
  {/snippet}
</Header>
```

## Props

| Prop | Type | Default | Description / 描述 |
|------|------|---------|-------------------|
| `title` | `string` | `''` | Header title / 标题 |
| `identity` | `Identity \| null` | — | User identity / 用户身份 |
| `showSearch` | `boolean` | `false` | Show search bar / 显示搜索栏 |
| `actions` | `Snippet` | — | Custom actions / 自定义操作 |
| `class` | `string` | — | Additional CSS classes / 额外样式 |
