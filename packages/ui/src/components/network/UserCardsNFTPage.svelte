<script lang="ts">
  import { t } from '@svadmin/core/i18n';
  import * as Card from '../ui/card/index.js';
  import { Badge } from '../ui/badge/index.js';
  import { Button } from '../ui/button/index.js';
  import { Input } from '../ui/input/index.js';
  import { Check, ExternalLink, Heart, Plus, Search } from '@lucide/svelte';

  interface NFTUser {
    id: string;
    name: string;
    username: string;
    bio: string;
    collectionCount: number;
    floorPrice: string;
    floorValue: number;
    volume: string;
    verified: boolean;
    tags: string[];
    trend: string;
    owners: number;
  }

  let searchQuery = $state('');
  let sortMode = $state<'volume' | 'floor' | 'collections'>('volume');
  let connectedIds = $state<string[]>([]);

  const users: NFTUser[] = [
    { id: '1', name: 'CryptoArt Studio', username: '@cryptoart', bio: 'Curated digital art collection featuring generative abstracts.', collectionCount: 42, floorPrice: '0.5 ETH', floorValue: 0.5, volume: '128.3 ETH', verified: true, tags: ['Art', 'Generative'], trend: '+12%', owners: 1840 },
    { id: '2', name: 'PixelPunk Collective', username: '@pixelpunk', bio: 'On-chain pixel art characters with unique traits and rarity tiers.', collectionCount: 18, floorPrice: '1.2 ETH', floorValue: 1.2, volume: '342.7 ETH', verified: true, tags: ['PFP', 'Pixel'], trend: '+8%', owners: 6200 },
    { id: '3', name: 'MetaVerse Builders', username: '@metabuild', bio: '3D architectural models and tradeable spaces for virtual worlds.', collectionCount: 7, floorPrice: '0.8 ETH', floorValue: 0.8, volume: '56.1 ETH', verified: false, tags: ['3D', 'Virtual'], trend: '-3%', owners: 980 },
    { id: '4', name: 'SoundWave NFT', username: '@soundwave', bio: 'Music-backed NFTs with on-chain audio and royalty splits.', collectionCount: 23, floorPrice: '0.3 ETH', floorValue: 0.3, volume: '89.4 ETH', verified: true, tags: ['Music', 'Audio'], trend: '+5%', owners: 2210 },
    { id: '5', name: 'GameAssets DAO', username: '@gameassets', bio: 'In-game items, skins, and collectibles for Web3 gaming economies.', collectionCount: 156, floorPrice: '0.05 ETH', floorValue: 0.05, volume: '412.8 ETH', verified: true, tags: ['Gaming', 'Items'], trend: '+18%', owners: 10420 },
    { id: '6', name: 'PhotoVerse', username: '@photoverse', bio: 'Curated photography NFTs from emerging and established artists.', collectionCount: 31, floorPrice: '0.15 ETH', floorValue: 0.15, volume: '67.2 ETH', verified: false, tags: ['Photo', 'Curated'], trend: '+2%', owners: 1430 },
  ];

  const filtered = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = users.filter((user) => {
      if (!query) return true;
      return user.name.toLowerCase().includes(query)
        || user.username.toLowerCase().includes(query)
        || user.tags.some((tag) => tag.toLowerCase().includes(query));
    });
    return [...list].sort((a, b) => {
      if (sortMode === 'floor') return b.floorValue - a.floorValue;
      if (sortMode === 'collections') return b.collectionCount - a.collectionCount;
      return Number.parseFloat(b.volume) - Number.parseFloat(a.volume);
    });
  });

  const verifiedCount = $derived(users.filter((user) => user.verified).length);
  const totalOwners = $derived(users.reduce((sum, user) => sum + user.owners, 0));

  function initials(name: string): string {
    return name.split(' ').map((part) => part[0]).join('').toUpperCase().slice(0, 2);
  }

  function toggleConnect(id: string) {
    connectedIds = connectedIds.includes(id)
      ? connectedIds.filter((connectedId) => connectedId !== id)
      : [...connectedIds, id];
  }

  function isConnected(id: string): boolean {
    return connectedIds.includes(id);
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <h2 class="text-xl font-semibold text-foreground">{t('network.userCards')}</h2>
      <p class="mt-1 text-sm text-muted-foreground">{t('network.userCardsDescription')}</p>
    </div>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="rounded-lg border border-border/70 bg-card px-3 py-2">
        <div class="text-sm font-semibold text-foreground">{users.length}</div>
        <div class="text-[10px] text-muted-foreground">Creators</div>
      </div>
      <div class="rounded-lg border border-border/70 bg-card px-3 py-2">
        <div class="text-sm font-semibold text-foreground">{verifiedCount}</div>
        <div class="text-[10px] text-muted-foreground">Verified</div>
      </div>
      <div class="rounded-lg border border-border/70 bg-card px-3 py-2">
        <div class="text-sm font-semibold text-foreground">{totalOwners.toLocaleString()}</div>
        <div class="text-[10px] text-muted-foreground">Owners</div>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="relative min-w-64 flex-1">
      <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input placeholder={t('common.search')} bind:value={searchQuery} class="pl-9" />
    </div>
    <div class="flex overflow-hidden rounded-lg border border-border bg-background">
      {#each [{ id: 'volume', label: 'Volume' }, { id: 'floor', label: 'Floor' }, { id: 'collections', label: 'Collections' }] as option (option.id)}
        <button
          class="h-9 px-3 text-xs font-medium transition-colors {sortMode === option.id ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}"
          onclick={() => sortMode = option.id as typeof sortMode}
        >
          {option.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
    {#each filtered as user (user.id)}
      <Card.Card class="overflow-hidden border-border/70 bg-card transition-colors hover:border-primary/35">
        <div class="relative h-20 bg-[linear-gradient(120deg,oklch(0.96_0.018_210),oklch(0.94_0.02_155),oklch(0.96_0.018_85))]">
          <div class="absolute bottom-3 right-3 rounded-full bg-background/85 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">{user.trend}</div>
        </div>
        <Card.CardContent class="relative px-4 pb-4">
          <div class="-mt-8 mb-3 flex items-end gap-3">
            <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border-4 border-card bg-primary/10 font-bold text-primary">
              {initials(user.name)}
            </div>
            <div class="min-w-0 flex-1 pb-0.5">
              <div class="flex items-center gap-1.5">
                <h4 class="truncate text-sm font-semibold text-foreground">{user.name}</h4>
                {#if user.verified}
                  <Check class="h-3.5 w-3.5 shrink-0 text-blue-600" />
                {/if}
              </div>
              <p class="text-xs text-muted-foreground">{user.username}</p>
            </div>
          </div>

          <p class="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{user.bio}</p>

          <div class="mb-3 flex flex-wrap gap-1">
            {#each user.tags as tag (tag)}
              <Badge variant="outline" class="text-[10px]">{tag}</Badge>
            {/each}
          </div>

          <div class="grid grid-cols-3 gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div>
              <div class="text-sm font-semibold text-foreground">{user.collectionCount}</div>
              <div class="text-[10px] text-muted-foreground">{t('network.nftCollection')}</div>
            </div>
            <div>
              <div class="text-sm font-semibold text-foreground">{user.floorPrice}</div>
              <div class="text-[10px] text-muted-foreground">{t('network.floorPrice')}</div>
            </div>
            <div>
              <div class="text-xs font-semibold text-foreground">{user.volume}</div>
              <div class="text-[10px] text-muted-foreground">{t('network.volume')}</div>
            </div>
          </div>

          <div class="mt-3 flex gap-2">
            <Button size="sm" variant={isConnected(user.id) ? 'outline' : 'default'} class="flex-1" onclick={() => toggleConnect(user.id)}>
              {#if isConnected(user.id)}
                <Check class="h-3.5 w-3.5" />
                {t('network.connected')}
              {:else}
                <Plus class="h-3.5 w-3.5" />
                {t('network.connect')}
              {/if}
            </Button>
            <Button size="sm" variant="ghost" aria-label="Favorite creator">
              <Heart class="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" aria-label="Open creator">
              <ExternalLink class="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card.CardContent>
      </Card.Card>
    {/each}
  </div>
</div>
