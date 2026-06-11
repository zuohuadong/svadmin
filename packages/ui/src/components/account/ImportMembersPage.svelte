<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Download, FileText, CheckCircle2, Loader2, Upload, ArrowRight, AlertTriangle, Columns3, UsersRound, Clock3 } from '@lucide/svelte';

  type ImportStage = 'upload' | 'preview' | 'mapping' | 'importing' | 'complete';
  type MappingKey = 'name' | 'email' | 'role' | 'department' | 'status';

  interface PreviewRow {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: 'ready' | 'warning';
    note: string;
  }

  interface MappingField {
    key: MappingKey;
    label: string;
    required: boolean;
    source: string;
  }

  let isDragging = $state(false);
  let fileName = $state('team-import-2026.csv');
  let currentStage = $state<ImportStage>('upload');
  let progress = $state(0);
  let importCount = $state(0);
  let inviteImmediately = $state(true);
  let defaultRole = $state('Member');

  let mappings = $state<MappingField[]>([
    { key: 'name', label: '成员姓名', required: true, source: 'full_name' },
    { key: 'email', label: '邮箱地址', required: true, source: 'work_email' },
    { key: 'role', label: '默认角色', required: false, source: 'role' },
    { key: 'department', label: '部门', required: false, source: 'team' },
    { key: 'status', label: '成员状态', required: false, source: 'invite_status' },
  ]);

  const csvColumns = ['full_name', 'work_email', 'role', 'team', 'invite_status', 'manager'];
  const previewRows: PreviewRow[] = [
    { id: '1', name: 'Lin Xia', email: 'lin.xia@example.com', role: 'Admin', department: 'Operations', status: 'ready', note: '字段完整' },
    { id: '2', name: 'Maya Patel', email: 'maya.patel@example.com', role: 'Editor', department: 'Growth', status: 'ready', note: '字段完整' },
    { id: '3', name: 'Owen King', email: 'owen.king@example', role: 'Viewer', department: 'Finance', status: 'warning', note: '邮箱格式需确认' },
    { id: '4', name: 'Chen Wei', email: 'chen.wei@example.com', role: 'Member', department: 'Support', status: 'ready', note: '将发送邀请' },
  ];
  const stageItems = [
    { id: 'upload', label: '上传文件', icon: Upload },
    { id: 'preview', label: '预览数据', icon: FileText },
    { id: 'mapping', label: '字段映射', icon: Columns3 },
    { id: 'complete', label: '完成导入', icon: CheckCircle2 },
  ] satisfies { id: ImportStage; label: string; icon: typeof Upload }[];

  const readyCount = $derived(previewRows.filter((row) => row.status === 'ready').length);
  const warningCount = $derived(previewRows.length - readyCount);
  const currentStageIndex = $derived(stageItems.findIndex((stage) => stage.id === (currentStage === 'importing' ? 'mapping' : currentStage)));

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) processFile(file);
  }

  function processFile(file: File) {
    fileName = file.name;
    progress = 45;
    currentStage = 'preview';
  }

  function updateMapping(key: MappingKey, source: string) {
    mappings = mappings.map((item) => (item.key === key ? { ...item, source } : item));
  }

  function startImport() {
    currentStage = 'importing';
    progress = 62;

    const interval = setInterval(() => {
      progress = Math.min(progress + 9, 100);
      if (progress >= 100) {
        clearInterval(interval);
        importCount = readyCount;
        currentStage = 'complete';
      }
    }, 180);
  }

  function resetImport() {
    fileName = '';
    currentStage = 'upload';
    progress = 0;
    importCount = 0;
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('account.importMembers')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('account.importMembersDescription')}</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline" size="sm">
        <Download class="h-3.5 w-3.5 mr-1" />模板下载
      </Button>
      <Button size="sm" onclick={() => { currentStage = 'preview'; fileName ||= 'team-import-2026.csv'; }}>
        使用示例数据
      </Button>
    </div>
  </div>

  <Card.Card class="border-border/70 bg-card">
    <Card.CardContent class="p-4">
      <div class="grid gap-3 md:grid-cols-4">
        {#each stageItems as stage, index (stage.id)}
          {@const isActive = index === currentStageIndex || (stage.id === 'complete' && currentStage === 'complete')}
          {@const isDone = index < currentStageIndex || currentStage === 'complete'}
          <div class="flex items-center gap-3 rounded-xl border px-3 py-3 {isActive ? 'border-primary/40 bg-primary/5' : 'border-border/60 bg-muted/20'}">
            <div class="flex h-9 w-9 items-center justify-center rounded-lg {isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}">
              {#if isDone}
                <CheckCircle2 class="h-4 w-4" />
              {:else}
                <stage.icon class="h-4 w-4" />
              {/if}
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">{stage.label}</p>
              <p class="text-xs text-muted-foreground">Step {index + 1}</p>
            </div>
          </div>
        {/each}
      </div>
    </Card.CardContent>
  </Card.Card>

  {#if currentStage === 'complete'}
    <Card.Card class="border-emerald-500/30 bg-emerald-50/70">
      <Card.CardContent class="grid gap-5 p-6 lg:grid-cols-[1fr_18rem]">
        <div class="flex items-start gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <CheckCircle2 class="h-7 w-7" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-emerald-900">{t('account.importComplete')}</h3>
            <p class="mt-1 text-sm text-emerald-800">{t('account.imported', { count: importCount })}，{warningCount} 条记录已进入待确认队列。</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <Button onclick={resetImport}>{t('common.back')}</Button>
              <Button variant="outline">查看导入报告</Button>
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-emerald-500/20 bg-white/70 p-4">
          <p class="text-sm font-semibold text-emerald-950">导入摘要</p>
          <div class="mt-3 space-y-2 text-sm text-emerald-900">
            <div class="flex justify-between"><span>已创建成员</span><strong>{importCount}</strong></div>
            <div class="flex justify-between"><span>已发送邀请</span><strong>{inviteImmediately ? importCount : 0}</strong></div>
            <div class="flex justify-between"><span>待确认记录</span><strong>{warningCount}</strong></div>
          </div>
        </div>
      </Card.CardContent>
    </Card.Card>
  {:else}
    <div class="grid gap-4 xl:grid-cols-[1fr_18rem]">
      <div class="space-y-4">
        <Card.Card class="border-border/60">
          <Card.CardContent class="p-6">
            {#if currentStage === 'upload'}
              <label
                for="file-input"
                class="block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors {isDragging ? 'border-primary bg-primary/5' : 'border-border/70 hover:border-primary/40'}"
                ondragover={handleDragOver}
                ondragleave={handleDragLeave}
                ondrop={handleDrop}
              >
                <Upload class="mx-auto h-10 w-10 text-muted-foreground" />
                <p class="mt-3 text-sm font-medium text-foreground">{t('account.dragOrClick')}</p>
                <p class="mt-1 text-xs text-muted-foreground">{t('account.supportedFormats')}，建议小于 2,000 行。</p>
                <span class="mt-4 inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground">
                  {t('common.upload')}
                </span>
                <input id="file-input" type="file" accept=".csv,.xlsx" class="sr-only" onchange={handleFileSelect} />
              </label>
            {:else if currentStage === 'preview'}
              <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-foreground">{fileName}</p>
                    <p class="text-xs text-muted-foreground">检测到 {previewRows.length} 行、{csvColumns.length} 列，导入前请确认异常记录。</p>
                  </div>
                  <div class="flex gap-2">
                    <Badge class="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10">{readyCount} 可导入</Badge>
                    <Badge class="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">{warningCount} 待确认</Badge>
                  </div>
                </div>

                <div class="overflow-hidden rounded-xl border border-border/60">
                  <table class="w-full text-sm">
                    <thead class="bg-muted/40 text-xs text-muted-foreground">
                      <tr>
                        <th class="px-4 py-3 text-left font-semibold">姓名</th>
                        <th class="px-4 py-3 text-left font-semibold">邮箱</th>
                        <th class="px-4 py-3 text-left font-semibold">角色</th>
                        <th class="px-4 py-3 text-left font-semibold">部门</th>
                        <th class="px-4 py-3 text-left font-semibold">状态</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border/60">
                      {#each previewRows as row (row.id)}
                        <tr class="bg-card">
                          <td class="px-4 py-3 font-medium text-foreground">{row.name}</td>
                          <td class="px-4 py-3 text-muted-foreground">{row.email}</td>
                          <td class="px-4 py-3 text-foreground">{row.role || defaultRole}</td>
                          <td class="px-4 py-3 text-muted-foreground">{row.department}</td>
                          <td class="px-4 py-3">
                            <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium {row.status === 'ready' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'}">
                              {#if row.status === 'ready'}<CheckCircle2 class="h-3 w-3" />{:else}<AlertTriangle class="h-3 w-3" />{/if}
                              {row.note}
                            </span>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <div class="flex justify-end gap-2">
                  <Button variant="outline" onclick={resetImport}>{t('common.back')}</Button>
                  <Button onclick={() => currentStage = 'mapping'}>{t('common.next')} <ArrowRight class="h-3.5 w-3.5 ml-1" /></Button>
                </div>
              </div>
            {:else}
              <div class="space-y-5">
                <div>
                  <p class="text-sm font-semibold text-foreground">字段映射</p>
                  <p class="mt-1 text-xs text-muted-foreground">把 CSV 列绑定到成员字段，未映射的列会被忽略。</p>
                </div>

                <div class="grid gap-3 md:grid-cols-2">
                  {#each mappings as field (field.key)}
                    <div class="rounded-xl border border-border/60 bg-muted/20 p-4">
                      <div class="mb-2 flex items-center justify-between gap-2">
                        <span class="text-sm font-semibold text-foreground">{field.label}</span>
                        {#if field.required}<Badge variant="outline" class="text-[10px]">必填</Badge>{/if}
                      </div>
                      <select
                        class="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        value={field.source}
                        onchange={(event) => updateMapping(field.key, event.currentTarget.value)}
                      >
                        {#each csvColumns as column (column)}
                          <option value={column}>{column}</option>
                        {/each}
                        <option value="__ignore">不导入</option>
                      </select>
                    </div>
                  {/each}
                </div>

                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="rounded-xl border border-border/60 bg-card p-4">
                    <span class="text-sm font-semibold text-foreground">默认角色</span>
                    <Input class="mt-2" bind:value={defaultRole} />
                  </label>
                  <label class="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4">
                    <span>
                      <span class="block text-sm font-semibold text-foreground">立即发送邀请</span>
                      <span class="text-xs text-muted-foreground">导入完成后自动发送加入邮件</span>
                    </span>
                    <input class="h-4 w-4 accent-primary" type="checkbox" bind:checked={inviteImmediately} />
                  </label>
                </div>

                {#if currentStage === 'importing'}
                  <div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div class="flex items-center gap-2 text-sm font-medium text-primary">
                      <Loader2 class="h-4 w-4 animate-spin" />正在导入成员
                    </div>
                    <div class="mt-3 h-2 overflow-hidden rounded-full bg-primary/10">
                      <div class="h-full rounded-full bg-primary transition-all duration-300" style="width: {progress}%"></div>
                    </div>
                  </div>
                {/if}

                <div class="flex justify-end gap-2">
                  <Button variant="outline" onclick={() => currentStage = 'preview'} disabled={currentStage === 'importing'}>{t('common.back')}</Button>
                  <Button onclick={startImport} disabled={currentStage === 'importing'}>
                    {#if currentStage === 'importing'}<Loader2 class="h-4 w-4 animate-spin mr-2" />{/if}
                    开始导入
                  </Button>
                </div>
              </div>
            {/if}
          </Card.CardContent>
        </Card.Card>
      </div>

      <div class="space-y-4">
        <Card.Card class="border-border/60">
          <Card.CardContent class="space-y-3 p-4">
            {#each [
              { label: '待导入', value: previewRows.length, icon: UsersRound },
              { label: '字段数量', value: csvColumns.length, icon: Columns3 },
              { label: '预计耗时', value: '2 min', icon: Clock3 },
            ] as item (item.label)}
              <div class="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <span class="flex items-center gap-2 text-xs text-muted-foreground"><item.icon class="h-3.5 w-3.5" />{item.label}</span>
                <span class="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            {/each}
          </Card.CardContent>
        </Card.Card>

        <Card.Card class="border-dashed bg-muted/20">
          <Card.CardContent class="p-4 text-sm text-muted-foreground">
            <p class="font-medium text-foreground">导入规则</p>
            <p class="mt-2">重复邮箱会自动合并为一条邀请；异常记录不会阻断正常成员导入。</p>
          </Card.CardContent>
        </Card.Card>
      </div>
    </div>
  {/if}
</div>
