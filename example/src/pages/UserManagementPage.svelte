<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { KeyRound, ShieldCheck, UserPlus, Users } from '@lucide/svelte';

  interface User { id: number; name: string; email: string; status: string; department: string; lastActiveAt: string; }
  interface Role { id: number; name: string; scope: string; level: string; }
  type UserManagementResource = 'users' | 'roles' | 'permissions' | 'user_accounts' | 'user_logs' | 'user_settings';

  let { resourceName = 'users' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const usersQuery = useList({ resource: 'users', pagination: { mode: 'off' } });
  const rolesQuery = useList({ resource: 'roles', pagination: { mode: 'off' } });
  const permissionsQuery = useList({ resource: 'permissions', pagination: { mode: 'off' } });
  const accountsQuery = useList({ resource: 'user_accounts', pagination: { mode: 'off' } });
  const logsQuery = useList({ resource: 'user_logs', pagination: { mode: 'off' } });
  const settingsQuery = useList({ resource: 'user_settings', pagination: { mode: 'off' } });
  const users = $derived((usersQuery.data?.data ?? []) as unknown as User[]);
  const roles = $derived((rolesQuery.data?.data ?? []) as unknown as Role[]);
  const permissionCount = $derived(permissionsQuery.data?.total ?? permissionsQuery.data?.data?.length ?? 0);
  const accountCount = $derived(accountsQuery.data?.total ?? accountsQuery.data?.data?.length ?? 0);
  const logCount = $derived(logsQuery.data?.total ?? logsQuery.data?.data?.length ?? 0);
  const settingsCount = $derived(settingsQuery.data?.total ?? settingsQuery.data?.data?.length ?? 0);
  const activeUsers = $derived(users.filter((user) => user.status === 'active').length);
  const pageCopy = $derived.by(() => {
    const copies: Record<UserManagementResource, { zhTitle: string; enTitle: string; zhDesc: string; enDesc: string; zhAction: string; enAction: string }> = {
      users: {
        zhTitle: '用户目录与入职工作台',
        enTitle: 'Users Directory and Onboarding Workspace',
        zhDesc: '覆盖用户搜索、角色筛选、状态分组和最近登录字段。',
        enDesc: 'Covers user search, role filters, status grouping, and last sign-in fields.',
        zhAction: '新增用户',
        enAction: 'Add user',
      },
      roles: {
        zhTitle: '角色矩阵与职责范围',
        enTitle: 'Role Matrix and Scope Workspace',
        zhDesc: '对照角色层级、职责范围与权限策略，适合做 RBAC 演示。',
        enDesc: 'Compares role levels, scopes, and permission policies for RBAC demos.',
        zhAction: '新增角色',
        enAction: 'Add role',
      },
      permissions: {
        zhTitle: '权限策略与审批边界',
        enTitle: 'Permission Policies and Approval Boundaries',
        zhDesc: '呈现模块、动作、角色和允许/复核/拒绝策略。',
        enDesc: 'Shows modules, actions, roles, and allow/review/deny effects.',
        zhAction: '新增权限',
        enAction: 'Add permission',
      },
      user_accounts: {
        zhTitle: '账户状态与登录风险',
        enTitle: 'Account Status and Sign-in Risk',
        zhDesc: '集中查看账户类型、锁定状态、最近登录和说明。',
        enDesc: 'Reviews account types, lock states, last sign-ins, and notes.',
        zhAction: '新增账户',
        enAction: 'Add account',
      },
      user_logs: {
        zhTitle: '用户日志与安全事件',
        enTitle: 'User Logs and Security Events',
        zhDesc: '按事件、IP、严重性和时间追踪用户安全活动。',
        enDesc: 'Tracks user security activity by event, IP, severity, and time.',
        zhAction: '记录事件',
        enAction: 'Log event',
      },
      user_settings: {
        zhTitle: '用户策略设置',
        enTitle: 'User Policy Settings',
        zhDesc: '维护两步验证、邀请审批和休眠账户提醒等策略。',
        enDesc: 'Maintains policies such as 2FA, invite approvals, and dormant reminders.',
        zhAction: '新增设置',
        enAction: 'Add setting',
      },
    };

    return resourceName in copies ? copies[resourceName as UserManagementResource] : copies.users;
  });

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function statusLabel(status: string): string {
    if (!isZh) return status;
    if (status === 'active') return '活跃';
    if (status === 'invited') return '已邀请';
    if (status === 'suspended') return '已停用';
    return status;
  }
</script>

<div class="space-y-6" data-app-page="user-management">
  <section class="grid gap-4 xl:grid-cols-[1fr_0.38fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <Badge>{isZh ? '组织权限' : 'User Management'}</Badge>
        <Card.Title class="mt-3 flex items-center gap-2 text-2xl">
          <Users class="h-6 w-6 text-primary" />{isZh ? pageCopy.zhTitle : pageCopy.enTitle}
        </Card.Title>
        <Card.Description>{isZh ? pageCopy.zhDesc : pageCopy.enDesc}</Card.Description>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 sm:grid-cols-3">
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '成员总数' : 'Members'}</p><p class="mt-2 text-2xl font-semibold">{users.length}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '活跃成员' : 'Active'}</p><p class="mt-2 text-2xl font-semibold">{activeUsers}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '权限策略' : 'Policies'}</p><p class="mt-2 text-2xl font-semibold">{permissionCount}</p></div>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Content class="space-y-4 p-5">
        <UserPlus class="h-5 w-5 text-primary" />
        <p class="text-sm text-muted-foreground">{isZh ? '邀请成员、调整权限、检查账户与日志都保留在同一个用户管理域。' : 'Invites, permissions, accounts, and logs stay in one user-management domain.'}</p>
        <Button class="w-full">{isZh ? pageCopy.zhAction : pageCopy.enAction}</Button>
      </Card.Content>
    </Card.Root>
  </section>

  <Card.Root class="overflow-hidden">
    <Card.Header class="border-b">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Card.Title class="text-base">{isZh ? pageCopy.zhTitle : pageCopy.enTitle}</Card.Title>
          <Card.Description>{isZh ? pageCopy.zhDesc : pageCopy.enDesc}</Card.Description>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline">{isZh ? '所有角色' : 'All roles'}</Button>
          <Button variant="outline">{isZh ? '所有用户' : 'All users'}</Button>
          <Button><UserPlus class="mr-2 h-4 w-4" />{isZh ? pageCopy.zhAction : pageCopy.enAction}</Button>
        </div>
      </div>
    </Card.Header>
    <Card.Content class="p-0">
      <div class="overflow-x-auto">
        <table class="w-full min-w-[760px] text-sm">
          <thead class="border-b bg-muted/35 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th class="px-5 py-3 text-left">{isZh ? '用户' : 'User'}</th>
              <th class="px-5 py-3 text-left">{isZh ? '角色' : 'Role'}</th>
              <th class="px-5 py-3 text-left">{isZh ? '状态' : 'Status'}</th>
              <th class="px-5 py-3 text-left">{isZh ? '加入日期' : 'Joined'}</th>
              <th class="px-5 py-3 text-left">{isZh ? '最近登录' : 'Last Sign In'}</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each users as user (user.id)}
              <tr class="transition hover:bg-muted/25">
                <td class="px-5 py-4">
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(user.name)}</span>
                    <div class="min-w-0">
                      <p class="truncate font-semibold">{user.name}</p>
                      <p class="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 text-muted-foreground">{roles[(user.id - 1) % Math.max(roles.length, 1)]?.name ?? '-'}</td>
                <td class="px-5 py-4"><Badge variant="outline">{statusLabel(user.status)}</Badge></td>
                <td class="px-5 py-4 text-muted-foreground">2026-06-{String(8 + user.id).padStart(2, '0')}</td>
                <td class="px-5 py-4 text-muted-foreground">{user.lastActiveAt}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card.Content>
  </Card.Root>

  <section class="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b"><Card.Title class="text-base">{isZh ? '团队成员' : 'Team Members'}</Card.Title></Card.Header>
      <Card.Content class="p-0">
        <div class="divide-y">
          {#each users as user (user.id)}
            <div class="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(user.name)}</span><div class="min-w-0"><p class="truncate font-semibold">{user.name}</p><p class="truncate text-xs text-muted-foreground">{user.email}</p></div></div>
              <Badge variant="outline">{user.department}</Badge>
              <p class="text-xs text-muted-foreground">{user.lastActiveAt}</p>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
    <div class="grid gap-4 content-start">
      <Card.Root>
        <Card.Header>
          <Card.Title class="flex items-center gap-2 text-base"><ShieldCheck class="h-4 w-4 text-primary" />{isZh ? '管理摘要' : 'Management Summary'}</Card.Title>
        </Card.Header>
        <Card.Content class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '角色' : 'Roles'}</p><p class="mt-1 text-xl font-semibold">{roles.length}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '账户' : 'Accounts'}</p><p class="mt-1 text-xl font-semibold">{accountCount}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '日志' : 'Logs'}</p><p class="mt-1 text-xl font-semibold">{logCount}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '设置' : 'Settings'}</p><p class="mt-1 text-xl font-semibold">{settingsCount}</p></div>
        </Card.Content>
      </Card.Root>
      <Card.Root><Card.Content class="p-5"><KeyRound class="h-5 w-5 text-primary" /><p class="mt-3 text-sm text-muted-foreground">{isZh ? '最近安全日志和权限审计可在系统页面继续查看。' : 'Recent security logs and access audits are available from system pages.'}</p></Card.Content></Card.Root>
    </div>
  </section>

  <AutoTable {resourceName} />
</div>
