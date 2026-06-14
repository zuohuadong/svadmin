<script lang="ts">
  import { useList } from '@svadmin/core';
  import { getLocale } from '@svadmin/core/i18n';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    KeyRound,
    LockKeyhole,
    ShieldCheck,
    SlidersHorizontal,
    UserCog,
    UserPlus,
    Users,
  } from '@lucide/svelte';

  interface User {
    id: number;
    name: string;
    email: string;
    status: string;
    department: string;
    lastActiveAt: string;
  }

  interface Role {
    id: number;
    name: string;
    scope: string;
    level: string;
    description?: string;
  }

  interface Permission {
    id: number;
    module: string;
    action: string;
    roleId: number;
    effect: string;
    updatedAt: string;
    notes?: string;
  }

  interface UserAccount {
    id: number;
    userId: number;
    accountType: string;
    status: string;
    lastSignInAt: string;
    notes?: string;
  }

  interface UserLog {
    id: number;
    userId: number;
    event: string;
    ipAddress: string;
    severity: string;
    createdAt: string;
    details?: string;
  }

  interface UserSetting {
    id: number;
    setting: string;
    scope: string;
    status: string;
    ownerId: number;
    updatedAt: string;
  }

  type UserManagementResource = 'users' | 'roles' | 'permissions' | 'user_accounts' | 'user_logs' | 'user_settings';

  let { resourceName = 'users' } = $props<{ resourceName?: string }>();

  const locale = $derived(getLocale());
  const isZh = $derived(locale === 'zh-CN');
  const activeResource = $derived((['users', 'roles', 'permissions', 'user_accounts', 'user_logs', 'user_settings'].includes(resourceName) ? resourceName : 'users') as UserManagementResource);

  const usersQuery = useList({ resource: 'users', pagination: { mode: 'off' } });
  const rolesQuery = useList({ resource: 'roles', pagination: { mode: 'off' } });
  const permissionsQuery = useList({ resource: 'permissions', pagination: { mode: 'off' } });
  const accountsQuery = useList({ resource: 'user_accounts', pagination: { mode: 'off' } });
  const logsQuery = useList({ resource: 'user_logs', pagination: { mode: 'off' } });
  const settingsQuery = useList({ resource: 'user_settings', pagination: { mode: 'off' } });

  const users = $derived((usersQuery.data?.data ?? []) as unknown as User[]);
  const roles = $derived((rolesQuery.data?.data ?? []) as unknown as Role[]);
  const permissions = $derived((permissionsQuery.data?.data ?? []) as unknown as Permission[]);
  const accounts = $derived((accountsQuery.data?.data ?? []) as unknown as UserAccount[]);
  const logs = $derived((logsQuery.data?.data ?? []) as unknown as UserLog[]);
  const settings = $derived((settingsQuery.data?.data ?? []) as unknown as UserSetting[]);

  const activeUsers = $derived(users.filter((user) => user.status === 'active').length);
  const lockedAccounts = $derived(accounts.filter((account) => account.status === 'locked').length);
  const criticalLogs = $derived(logs.filter((log) => log.severity === 'critical' || log.severity === 'warning').length);
  const enabledSettings = $derived(settings.filter((setting) => setting.status === 'enabled').length);
  const permissionModules = $derived([...new Set(permissions.map((permission) => permission.module))]);

  const roleCards = $derived.by(() => roles.map((role, index) => {
    const assignedUsers = users.filter((user) => (user.id - 1) % Math.max(roles.length, 1) === index);
    const rolePermissions = permissions.filter((permission) => permission.roleId === role.id);
    return {
      ...role,
      assignedUsers,
      permissionCount: rolePermissions.length,
      effects: rolePermissions.map((permission) => permission.effect),
      health: rolePermissions.some((permission) => permission.effect === 'deny') ? 'review' : role.level === 'owner' ? 'critical' : 'healthy',
    };
  }));

  const pageCopy = $derived.by(() => {
    const copies: Record<UserManagementResource, { badge: string; title: string; description: string; action: string; focus: string }> = {
      users: {
        badge: isZh ? '用户管理' : 'User Management',
        title: isZh ? '用户目录与入职工作台' : 'Users Directory and Onboarding Workspace',
        description: isZh ? '覆盖用户搜索、角色筛选、状态分组、最近登录与团队分配。' : 'Covers user search, role filters, status groups, recent sign-ins, and team assignment.',
        action: isZh ? '新增用户' : 'Add user',
        focus: isZh ? '成员入职' : 'Member onboarding',
      },
      roles: {
        badge: isZh ? '角色管理' : 'Role Management',
        title: isZh ? '角色矩阵与职责范围' : 'Role Matrix and Scope Workspace',
        description: isZh ? '按角色层级、成员分配、权限覆盖和审计风险组织 RBAC 示例。' : 'Organizes the RBAC demo by role level, member assignment, permission coverage, and audit risk.',
        action: isZh ? '新增角色' : 'Add role',
        focus: isZh ? '权限矩阵' : 'Permission matrix',
      },
      permissions: {
        badge: isZh ? '权限策略' : 'Permissions',
        title: isZh ? '权限策略与审批边界' : 'Permission Policies and Approval Boundaries',
        description: isZh ? '呈现模块、动作、角色和允许/复核/拒绝策略，方便快速审查授权边界。' : 'Shows modules, actions, roles, and allow/review/deny effects for fast access-boundary review.',
        action: isZh ? '新增权限' : 'Add permission',
        focus: isZh ? '策略审查' : 'Policy review',
      },
      user_accounts: {
        badge: isZh ? '账户安全' : 'Accounts',
        title: isZh ? '账户状态与登录风险' : 'Account Status and Sign-in Risk',
        description: isZh ? '集中查看账户类型、锁定状态、最近登录和风险说明。' : 'Reviews account types, lock states, last sign-ins, and risk notes.',
        action: isZh ? '新增账户' : 'Add account',
        focus: isZh ? '登录风险' : 'Sign-in risk',
      },
      user_logs: {
        badge: isZh ? '审计日志' : 'Logs',
        title: isZh ? '用户日志与安全事件' : 'User Logs and Security Events',
        description: isZh ? '按事件、IP、严重性和时间追踪用户安全活动。' : 'Tracks user security activity by event, IP, severity, and time.',
        action: isZh ? '记录事件' : 'Log event',
        focus: isZh ? '安全时间线' : 'Security timeline',
      },
      user_settings: {
        badge: isZh ? '用户策略' : 'Settings',
        title: isZh ? '用户策略设置' : 'User Policy Settings',
        description: isZh ? '维护两步验证、邀请审批、休眠账户提醒与会话策略。' : 'Maintains 2FA, invite approval, dormant-account reminders, and session policies.',
        action: isZh ? '新增设置' : 'Add setting',
        focus: isZh ? '策略配置' : 'Policy configuration',
      },
    };

    return copies[activeResource];
  });

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function statusLabel(status: string): string {
    if (!isZh) return status;
    const labels: Record<string, string> = {
      active: '活跃',
      invited: '已邀请',
      suspended: '已停用',
      locked: '已锁定',
      internal: '内部',
      partner: '伙伴',
      enabled: '已启用',
      disabled: '已停用',
      warning: '预警',
      critical: '严重',
      info: '信息',
      allow: '允许',
      review: '复核',
      deny: '拒绝',
      none: '未授权',
      optional: '可选',
    };
    return labels[status] ?? status;
  }

  function roleLevelLabel(level: string): string {
    if (!isZh) return level;
    const labels: Record<string, string> = { owner: '所有者', manager: '经理', operator: '操作员', viewer: '只读' };
    return labels[level] ?? level;
  }

  function userName(userId: number): string {
    return users.find((user) => user.id === userId)?.name ?? `#${userId}`;
  }

  function roleName(roleId: number): string {
    return roles.find((role) => role.id === roleId)?.name ?? `#${roleId}`;
  }

  function moduleEffect(roleId: number, module: string): string {
    return permissions.find((permission) => permission.roleId === roleId && permission.module === module)?.effect ?? 'none';
  }
</script>

<div class="space-y-6" data-app-page="user-management" data-user-management-resource={activeResource}>
  <section class="grid gap-4 xl:grid-cols-[1fr_0.36fr]">
    <Card.Root class="overflow-hidden border-primary/20">
      <Card.Header class="border-b">
        <Badge>{pageCopy.badge}</Badge>
        <Card.Title class="mt-3 flex items-center gap-2 text-2xl">
          {#if activeResource === 'roles'}
            <ShieldCheck class="h-6 w-6 text-primary" />
          {:else if activeResource === 'permissions'}
            <KeyRound class="h-6 w-6 text-primary" />
          {:else if activeResource === 'user_accounts'}
            <LockKeyhole class="h-6 w-6 text-primary" />
          {:else if activeResource === 'user_logs'}
            <Activity class="h-6 w-6 text-primary" />
          {:else if activeResource === 'user_settings'}
            <SlidersHorizontal class="h-6 w-6 text-primary" />
          {:else}
            <Users class="h-6 w-6 text-primary" />
          {/if}
          {pageCopy.title}
        </Card.Title>
        <Card.Description>{pageCopy.description}</Card.Description>
      </Card.Header>
      <Card.Content class="grid gap-3 p-5 sm:grid-cols-4">
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '成员总数' : 'Members'}</p><p class="mt-2 text-2xl font-semibold">{users.length}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '角色数量' : 'Roles'}</p><p class="mt-2 text-2xl font-semibold">{roles.length}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '权限策略' : 'Policies'}</p><p class="mt-2 text-2xl font-semibold">{permissions.length}</p></div>
        <div class="rounded-xl border bg-card p-4"><p class="text-xs text-muted-foreground">{isZh ? '风险事件' : 'Risk events'}</p><p class="mt-2 text-2xl font-semibold">{criticalLogs}</p></div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="space-y-4 p-5">
        <UserPlus class="h-5 w-5 text-primary" />
        <div>
          <p class="font-semibold">{pageCopy.focus}</p>
          <p class="mt-2 text-sm text-muted-foreground">{isZh ? '用户、角色、权限、账户、日志和策略保持在一个可演示闭环。' : 'Users, roles, permissions, accounts, logs, and policies stay in one demo loop.'}</p>
        </div>
        <Button class="w-full">{pageCopy.action}</Button>
      </Card.Content>
    </Card.Root>
  </section>

  {#if activeResource === 'roles'}
    <section class="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
      <Card.Root class="overflow-hidden">
        <Card.Header class="border-b">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Card.Title class="text-base">{isZh ? '角色矩阵' : 'Role Matrix'}</Card.Title>
              <Card.Description>{isZh ? '对照每个角色的成员、模块权限和风险状态。' : 'Compare each role by members, module permissions, and risk state.'}</Card.Description>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button variant="outline">{isZh ? '所有角色' : 'All roles'}</Button>
              <Button variant="outline">{isZh ? '所有用户' : 'All users'}</Button>
              <Button><ShieldCheck class="mr-2 h-4 w-4" />{pageCopy.action}</Button>
            </div>
          </div>
        </Card.Header>
        <Card.Content class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[860px] text-sm">
              <thead class="border-b bg-muted/35 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th class="px-5 py-3 text-left">{isZh ? '角色' : 'Role'}</th>
                  <th class="px-5 py-3 text-left">{isZh ? '成员' : 'Members'}</th>
                  {#each permissionModules as module (module)}
                    <th class="px-5 py-3 text-left">{module}</th>
                  {/each}
                  <th class="px-5 py-3 text-left">{isZh ? '状态' : 'State'}</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                {#each roleCards as role (role.id)}
                  <tr class="transition hover:bg-muted/25">
                    <td class="px-5 py-4">
                      <p class="font-semibold">{role.name}</p>
                      <p class="mt-1 text-xs text-muted-foreground">{roleLevelLabel(role.level)} · {role.scope}</p>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-wrap gap-1">
                        {#each role.assignedUsers as user (user.id)}
                          <span class="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{initials(user.name)}</span>
                        {:else}
                          <span class="text-xs text-muted-foreground">{isZh ? '未分配' : 'Unassigned'}</span>
                        {/each}
                      </div>
                    </td>
                    {#each permissionModules as module (module)}
                      <td class="px-5 py-4"><Badge variant="outline">{statusLabel(moduleEffect(role.id, module))}</Badge></td>
                    {/each}
                    <td class="px-5 py-4">
                      <Badge variant={role.health === 'critical' ? 'default' : 'outline'}>{role.health === 'critical' ? (isZh ? '高权限' : 'Privileged') : role.health === 'review' ? (isZh ? '需复核' : 'Review') : (isZh ? '稳定' : 'Healthy')}</Badge>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card.Root>

      <div class="grid content-start gap-4">
        <Card.Root>
          <Card.Header><Card.Title class="flex items-center gap-2 text-base"><KeyRound class="h-4 w-4 text-primary" />{isZh ? '权限覆盖' : 'Permission Coverage'}</Card.Title></Card.Header>
          <Card.Content class="space-y-3">
            {#each roleCards as role (role.id)}
              <div class="rounded-xl border p-3">
                <div class="flex items-center justify-between gap-3"><p class="font-medium">{role.name}</p><Badge variant="outline">{role.permissionCount}</Badge></div>
                <p class="mt-1 text-xs text-muted-foreground">{role.description ?? role.scope}</p>
              </div>
            {/each}
          </Card.Content>
        </Card.Root>
        <Card.Root>
          <Card.Header><Card.Title class="flex items-center gap-2 text-base"><AlertTriangle class="h-4 w-4 text-primary" />{isZh ? '审计提醒' : 'Audit Signals'}</Card.Title></Card.Header>
          <Card.Content class="space-y-3 text-sm text-muted-foreground">
            <p>{isZh ? '所有者角色应定期复核两步验证、导出权限与成员变更。' : 'Owner roles should regularly review 2FA, export rights, and membership changes.'}</p>
            <p>{isZh ? '拒绝或复核策略会在权限页和日志页形成闭环。' : 'Deny or review policies close the loop on the permissions and logs pages.'}</p>
          </Card.Content>
        </Card.Root>
      </div>
    </section>
  {:else if activeResource === 'permissions'}
    <section class="grid gap-4 lg:grid-cols-3">
      {#each permissions as permission (permission.id)}
        <Card.Root>
          <Card.Header>
            <div class="flex items-center justify-between gap-3"><Badge>{permission.module}</Badge><Badge variant="outline">{statusLabel(permission.effect)}</Badge></div>
            <Card.Title class="text-base">{permission.action}</Card.Title>
            <Card.Description>{roleName(permission.roleId)}</Card.Description>
          </Card.Header>
          <Card.Content><p class="text-sm text-muted-foreground">{permission.notes}</p><p class="mt-3 text-xs font-medium text-primary">{permission.updatedAt}</p></Card.Content>
        </Card.Root>
      {/each}
    </section>
  {:else if activeResource === 'user_accounts'}
    <section class="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <Card.Root><Card.Header><Card.Title class="text-base">{isZh ? '账户风险概览' : 'Account Risk Overview'}</Card.Title></Card.Header><Card.Content class="grid gap-3 sm:grid-cols-3 xl:grid-cols-1"><div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '账户' : 'Accounts'}</p><p class="text-2xl font-semibold">{accounts.length}</p></div><div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '锁定' : 'Locked'}</p><p class="text-2xl font-semibold">{lockedAccounts}</p></div><div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '活跃成员' : 'Active members'}</p><p class="text-2xl font-semibold">{activeUsers}</p></div></Card.Content></Card.Root>
      <Card.Root class="overflow-hidden"><Card.Header class="border-b"><Card.Title class="text-base">{isZh ? '登录状态' : 'Sign-in Status'}</Card.Title></Card.Header><Card.Content class="divide-y p-0">{#each accounts as account (account.id)}<div class="grid gap-2 px-5 py-4 md:grid-cols-[1fr_auto_auto]"><div><p class="font-medium">{userName(account.userId)}</p><p class="text-xs text-muted-foreground">{account.notes}</p></div><Badge variant="outline">{statusLabel(account.accountType)}</Badge><span class="text-xs text-muted-foreground">{account.lastSignInAt}</span></div>{/each}</Card.Content></Card.Root>
    </section>
  {:else if activeResource === 'user_logs'}
    <section class="grid gap-4 xl:grid-cols-[1fr_0.42fr]">
      <Card.Root class="overflow-hidden"><Card.Header class="border-b"><Card.Title class="text-base">{isZh ? '安全时间线' : 'Security Timeline'}</Card.Title></Card.Header><Card.Content class="divide-y p-0">{#each logs as log (log.id)}<div class="grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto]"><span class="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Clock3 class="h-4 w-4" /></span><div><p class="font-medium">{log.event}</p><p class="text-xs text-muted-foreground">{userName(log.userId)} · {log.ipAddress} · {log.details}</p></div><Badge variant="outline">{statusLabel(log.severity)}</Badge></div>{/each}</Card.Content></Card.Root>
      <Card.Root><Card.Header><Card.Title class="text-base">{isZh ? '审计摘要' : 'Audit Summary'}</Card.Title></Card.Header><Card.Content class="space-y-3"><div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '日志总数' : 'Logs'}</p><p class="text-2xl font-semibold">{logs.length}</p></div><div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '需关注' : 'Needs attention'}</p><p class="text-2xl font-semibold">{criticalLogs}</p></div></Card.Content></Card.Root>
    </section>
  {:else if activeResource === 'user_settings'}
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {#each settings as setting (setting.id)}
        <Card.Root>
          <Card.Header><div class="flex items-center justify-between gap-3"><SlidersHorizontal class="h-5 w-5 text-primary" /><Badge variant="outline">{statusLabel(setting.status)}</Badge></div><Card.Title class="text-base">{setting.setting}</Card.Title><Card.Description>{setting.scope}</Card.Description></Card.Header>
          <Card.Content><p class="text-sm text-muted-foreground">{isZh ? '负责人' : 'Owner'}: {userName(setting.ownerId)}</p><p class="mt-3 text-xs font-medium text-primary">{setting.updatedAt}</p></Card.Content>
        </Card.Root>
      {/each}
      <Card.Root class="border-primary/30"><Card.Content class="p-5"><CheckCircle2 class="h-5 w-5 text-primary" /><p class="mt-3 text-sm text-muted-foreground">{isZh ? `${enabledSettings} 条策略已启用，适合演示企业级账户治理。` : `${enabledSettings} policies are enabled for enterprise account governance demos.`}</p></Card.Content></Card.Root>
    </section>
  {:else}
    <Card.Root class="overflow-hidden">
      <Card.Header class="border-b">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Card.Title class="text-base">{isZh ? '用户目录' : 'User Directory'}</Card.Title>
            <Card.Description>{isZh ? '按用户、角色、状态、加入日期和最近登录查看成员。' : 'Review members by user, role, status, joined date, and last sign-in.'}</Card.Description>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button variant="outline">{isZh ? '所有角色' : 'All roles'}</Button>
            <Button variant="outline">{isZh ? '所有用户' : 'All users'}</Button>
            <Button><UserPlus class="mr-2 h-4 w-4" />{pageCopy.action}</Button>
          </div>
        </div>
      </Card.Header>
      <Card.Content class="p-0">
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-sm">
            <thead class="border-b bg-muted/35 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <tr><th class="px-5 py-3 text-left">{isZh ? '用户' : 'User'}</th><th class="px-5 py-3 text-left">{isZh ? '角色' : 'Role'}</th><th class="px-5 py-3 text-left">{isZh ? '状态' : 'Status'}</th><th class="px-5 py-3 text-left">{isZh ? '加入日期' : 'Joined'}</th><th class="px-5 py-3 text-left">{isZh ? '最近登录' : 'Last Sign In'}</th></tr>
            </thead>
            <tbody class="divide-y">
              {#each users as user (user.id)}
                <tr class="transition hover:bg-muted/25"><td class="px-5 py-4"><div class="flex min-w-0 items-center gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(user.name)}</span><div class="min-w-0"><p class="truncate font-semibold">{user.name}</p><p class="truncate text-xs text-muted-foreground">{user.email}</p></div></div></td><td class="px-5 py-4 text-muted-foreground">{roles[(user.id - 1) % Math.max(roles.length, 1)]?.name ?? '-'}</td><td class="px-5 py-4"><Badge variant="outline">{statusLabel(user.status)}</Badge></td><td class="px-5 py-4 text-muted-foreground">2026-06-{String(8 + user.id).padStart(2, '0')}</td><td class="px-5 py-4 text-muted-foreground">{user.lastActiveAt}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

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
    <div class="grid content-start gap-4">
      <Card.Root>
        <Card.Header><Card.Title class="flex items-center gap-2 text-base"><UserCog class="h-4 w-4 text-primary" />{isZh ? '管理摘要' : 'Management Summary'}</Card.Title></Card.Header>
        <Card.Content class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '角色' : 'Roles'}</p><p class="mt-1 text-xl font-semibold">{roles.length}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '账户' : 'Accounts'}</p><p class="mt-1 text-xl font-semibold">{accounts.length}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '日志' : 'Logs'}</p><p class="mt-1 text-xl font-semibold">{logs.length}</p></div>
          <div class="rounded-xl border p-3"><p class="text-xs text-muted-foreground">{isZh ? '设置' : 'Settings'}</p><p class="mt-1 text-xl font-semibold">{settings.length}</p></div>
        </Card.Content>
      </Card.Root>
      <Card.Root><Card.Content class="p-5"><KeyRound class="h-5 w-5 text-primary" /><p class="mt-3 text-sm text-muted-foreground">{isZh ? '角色、账户、日志与策略页都保留独立信息结构，并共享底部 CRUD 表格。' : 'Roles, accounts, logs, and policies keep distinct structures while sharing the CRUD table below.'}</p></Card.Content></Card.Root>
    </div>
  </section>

  <AutoTable {resourceName} />
</div>
