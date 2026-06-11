<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from './ui/card/index.js';
  import { Button } from './ui/button/index.js';
  import { Input } from './ui/input/index.js';
  import * as Alert from './ui/alert/index.js';
  import { Badge } from './ui/badge/index.js';
  import { Separator } from './ui/separator/index.js';
  import { Shield, Copy, CheckCircle2, AlertTriangle, ArrowRight, ArrowLeft } from '@lucide/svelte';

  type Step = 'intro' | 'scan' | 'verify' | 'recovery';

  let currentStep = $state<Step>('intro');
  let is2faEnabled = $state(false);
  let verifyError = $state('');
  let copiedRecovery = $state(false);
  let codeDigits = $state<string[]>(Array.from({ length: 6 }, () => ''));

  const verificationCode = $derived(codeDigits.join(''));
  const qrCells = [
    '11111110',
    '10010010',
    '10111010',
    '10100100',
    '11101010',
    '00101110',
    '11010100',
    '01110110',
  ].flatMap(row => [...row].map(cell => cell === '1'));

  const recoveryCodes = [
    'A1B2-C3D4', 'E5F6-G7H8', 'I9J0-K1L2',
    'M3N4-O5P6', 'Q7R8-S9T0', 'U1V2-W3X4',
    'Y5Z6-A7B8', 'C9D0-E1F2',
  ];

  function startSetup() {
    currentStep = 'scan';
  }

  function proceedToVerify() {
    currentStep = 'verify';
  }

  function handleVerify() {
    verifyError = '';
    if (verificationCode.length !== 6) {
      verifyError = t('auth.twoFactorEnterCode');
      return;
    }
    currentStep = 'recovery';
  }

  function handleDigitInput(e: Event, index: number) {
    const input = e.currentTarget as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    codeDigits[index] = digit;
    input.value = digit;
    if (digit && index < codeDigits.length - 1) {
      const next = input.parentElement?.children[index + 1] as HTMLInputElement | undefined;
      next?.focus();
    }
  }

  function completeSetup() {
    is2faEnabled = true;
    currentStep = 'intro';
  }

  function disable2fa() {
    is2faEnabled = false;
    currentStep = 'intro';
  }

  function copyRecoveryCodes() {
    navigator.clipboard?.writeText(recoveryCodes.join('\n'));
    copiedRecovery = true;
    setTimeout(() => { copiedRecovery = false; }, 2000);
  }
</script>

<div class="flex min-h-[70vh] items-center justify-center p-4">
  <div class="w-full max-w-lg space-y-6">
    {#if currentStep === 'intro' && !is2faEnabled}
      <!-- Intro -->
      <Card.Card class="border-border/60">
        <Card.CardContent class="space-y-6 p-8 text-center">
          <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Shield class="h-8 w-8" />
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold text-foreground">{t('auth.twoFactorSetup')}</h2>
            <p class="text-sm text-muted-foreground">{t('security.twoFactorDescription')}</p>
          </div>
          <div class="space-y-3 text-left">
            <div class="flex items-start gap-3 rounded-xl border p-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 text-sm font-bold">1</div>
              <div>
                <p class="text-sm font-medium text-foreground">{t('auth.twoFactorScanQR')}</p>
                <p class="text-xs text-muted-foreground">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-xl border p-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 text-sm font-bold">2</div>
              <div>
                <p class="text-sm font-medium text-foreground">{t('auth.twoFactorEnterCode')}</p>
                <p class="text-xs text-muted-foreground">6-digit code from your authenticator</p>
              </div>
            </div>
            <div class="flex items-start gap-3 rounded-xl border p-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 text-sm font-bold">3</div>
              <div>
                <p class="text-sm font-medium text-foreground">{t('auth.twoFactorSaveRecovery')}</p>
                <p class="text-xs text-muted-foreground">{t('auth.twoFactorRecoveryHint')}</p>
              </div>
            </div>
          </div>
          <Button class="w-full" onclick={startSetup}>
            {t('auth.twoFactorSetup')} <ArrowRight class="h-4 w-4 ml-2" />
          </Button>
        </Card.CardContent>
      </Card.Card>

    {:else if currentStep === 'scan'}
      <!-- QR Code -->
      <Card.Card class="border-border/60">
        <Card.CardContent class="space-y-6 p-8">
          <div class="text-center space-y-2">
            <h2 class="text-xl font-semibold text-foreground">{t('auth.twoFactorScanQR')}</h2>
            <p class="text-sm text-muted-foreground">Use your authenticator app to scan the code below.</p>
          </div>
          <div class="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20">
            <div class="grid grid-cols-8 gap-[2px]">
              {#each qrCells as filled, i (i)}
                <div class="h-3 w-3 rounded-[1px] {filled ? 'bg-foreground' : 'bg-transparent'}"></div>
              {/each}
            </div>
          </div>
          <div class="flex gap-3">
            <Button variant="outline" class="flex-1" onclick={() => currentStep = 'intro'}>
              <ArrowLeft class="h-4 w-4 mr-2" />{t('common.back')}
            </Button>
            <Button class="flex-1" onclick={proceedToVerify}>
              {t('common.next')} <ArrowRight class="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card.CardContent>
      </Card.Card>

    {:else if currentStep === 'verify'}
      <!-- Verify -->
      <Card.Card class="border-border/60">
        <Card.CardContent class="space-y-6 p-8">
          <div class="text-center space-y-2">
            <h2 class="text-xl font-semibold text-foreground">{t('auth.twoFactorVerify')}</h2>
            <p class="text-sm text-muted-foreground">{t('auth.twoFactorEnterCode')}</p>
          </div>

          {#if verifyError}
            <Alert.Root variant="destructive">
              <AlertTriangle class="h-4 w-4" />
              <Alert.Description>{verifyError}</Alert.Description>
            </Alert.Root>
          {/if}

          <div class="flex justify-center gap-2">
            {#each Array(6) as _, i (i)}
              <Input
                class="h-14 w-12 text-center text-xl font-bold"
                maxlength={1}
                inputmode="numeric"
                pattern="[0-9]*"
                bind:value={codeDigits[i]}
                oninput={(e: Event) => handleDigitInput(e, i)}
              />
            {/each}
          </div>

          <div class="flex gap-3">
            <Button variant="outline" class="flex-1" onclick={() => currentStep = 'scan'}>
              <ArrowLeft class="h-4 w-4 mr-2" />{t('common.back')}
            </Button>
            <Button class="flex-1" onclick={handleVerify}>
              {t('common.confirm')} <ArrowRight class="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card.CardContent>
      </Card.Card>

    {:else if currentStep === 'recovery'}
      <!-- Recovery codes -->
      <Card.Card class="border-border/60">
        <Card.CardContent class="space-y-6 p-8">
          <div class="text-center space-y-2">
            <div class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <CheckCircle2 class="h-6 w-6" />
            </div>
            <h2 class="text-xl font-semibold text-foreground">{t('auth.twoFactorRecovery')}</h2>
            <p class="text-sm text-muted-foreground">{t('auth.twoFactorRecoveryHint')}</p>
          </div>

          <div class="rounded-xl border bg-muted/20 p-4">
            <div class="grid grid-cols-2 gap-2 font-mono text-sm">
              {#each recoveryCodes as code, i (i)}
                <div class="rounded-lg bg-background px-3 py-1.5 text-center text-foreground">{code}</div>
              {/each}
            </div>
          </div>

          <div class="flex gap-3">
            <Button variant="outline" class="flex-1" onclick={copyRecoveryCodes}>
              {#if copiedRecovery}
                <CheckCircle2 class="h-4 w-4 mr-2" />{t('common.copied')}
              {:else}
                <Copy class="h-4 w-4 mr-2" />{t('common.copyAll')}
              {/if}
            </Button>
            <Button class="flex-1" onclick={completeSetup}>
              {t('account.completeSetup')} <ArrowRight class="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card.CardContent>
      </Card.Card>

    {:else}
      <!-- 2FA enabled state -->
      <Card.Card class="border-border/60">
        <Card.CardContent class="space-y-6 p-8 text-center">
          <div class="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <Shield class="h-8 w-8" />
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold text-foreground">{t('auth.twoFactorVerifySuccess')}</h2>
            <p class="text-sm text-muted-foreground">{t('security.twoFactorActive')}</p>
          </div>
          <Badge variant="secondary" class="bg-green-500/10 text-green-600">
            <CheckCircle2 class="h-3 w-3 mr-1" />2FA Active
          </Badge>
          <Separator />
          <Button variant="destructive" onclick={disable2fa}>
            {t('auth.twoFactorDisable')}
          </Button>
        </Card.CardContent>
      </Card.Card>
    {/if}
  </div>
</div>
