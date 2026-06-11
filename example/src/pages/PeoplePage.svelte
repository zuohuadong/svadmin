<script lang="ts">
  import { getLocale } from '@svadmin/core/i18n';
  import { navigate } from '@svadmin/core/router';
  import { useList } from '@svadmin/core';
  import { AutoTable, Badge, Button } from '@svadmin/ui';
  import * as Card from '@svadmin/ui/components/ui/card/index.js';
  import { ShieldCheck, UserPlus, Users } from '@lucide/svelte';

  let { resourceName } = $props<{ resourceName: string }>();

  const locale = $derived(getLocale());
  const tr = (en: string, zh: string) => locale === 'zh-CN' ? zh : en;
  const usersQuery = useList({ resource: 'users', pagination: { mode: 'off' } });
  const rolesQuery = useList({ resource: 'roles', pagination: { mode: 'off' } });
  const users = $derived((usersQuery.data?.data ?? []) as Record<string, unknown>[]);
  const roles = $derived((rolesQuery.data?.data ?? []) as Record<string, unknown>[]);
  const isRoles = $derived(resourceName === 'roles');
</script>

<div class="space-y-6">
  <section class="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm shadow-slate-900/[0.03]">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge class="mb-4 rounded-full bg-primary/10 text-primary hover:bg-primary/10">{tr('Access Control', '访问控制')}</Badge>
        <h1 class="text-3xl font-semibold tracking-tight">{isRoles ? tr('Roles and permissions', '角色与权限') : tr('Team members', '团队成员')}</h1>
        <p class="mt-2 max-w-2xl text-sm text-muted-foreground">
          {isRoles ? tr('Review permission levels and operational scope before editing role records.', '编辑角色记录前，先查看权限等级和运营范围。') : tr('Manage operators, invitations, departments, and warehouse responsibilities.', '管理操作员、邀请状态、部门和仓库职责。')}
        </p>
      </div>
      <Button class="rounded-xl" onclick={() => navigate(`/${resourceName}/create`)}>
        <UserPlus class="h-4 w-4" data-icon="inline-start" />
        {isRoles ? tr('New role', '新建角色') : tr('Invite user', '邀请用户')}
      </Button>
    </div>
  </section>

  <div class="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      <Card.Root class="rounded-3xl border-border/70 bg-card">
        <Card.Content class="flex items-center gap-4 p-5">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Users class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-muted-foreground">{tr('Active members', '活跃成员')}</p>
            <p class="text-2xl font-semibold">{users.filter((user) => user.status === 'active').length}</p>
          </div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="rounded-3xl border-border/70 bg-card">
        <Card.Content class="flex items-center gap-4 p-5">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"><ShieldCheck class="h-5 w-5" /></span>
          <div>
            <p class="text-sm text-muted-foreground">{tr('Permission roles', '权限角色')}</p>
            <p class="text-2xl font-semibold">{roles.length}</p>
          </div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="rounded-3xl border-border/70 bg-card">
        <Card.Header>
          <Card.Title>{tr('Role coverage', '角色覆盖')}</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-3">
          {#each roles as role (String(role.id))}
            <div class="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-3">
              <div>
                <p class="text-sm font-medium">{role.name}</p>
                <p class="text-xs text-muted-foreground">{role.scope}</p>
              </div>
              <Badge variant="outline">{role.level}</Badge>
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    </div>

    <AutoTable {resourceName} />
  </div>
</div>
