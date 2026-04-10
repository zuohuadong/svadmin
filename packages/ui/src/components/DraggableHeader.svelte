<script lang="ts">
  /**
   * DraggableHeader — Wraps table header cells with HTML5 Drag and Drop
   * to enable column reorder. Persists order to localStorage.
   *
   * Usage:
   *   <DraggableHeader columns={columns} resourceName="posts" onReorder={handleReorder}>
   *     {#snippet header(column, index)}
   *       <th>...</th>
   *     {/snippet}
   *   </DraggableHeader>
   */
  import type { Snippet } from 'svelte';

  interface Column {
    id: string;
    [key: string]: unknown;
  }

  interface Props {
    columns: Column[];
    resourceName: string;
    onReorder: (newOrder: Column[]) => void;
    header: Snippet<[Column, number, Record<string, any>]>;
  }

  let { columns, resourceName, onReorder, header }: Props = $props();

  let dragIndex = $state<number | null>(null);
  let dropIndex = $state<number | null>(null);

  // Restore saved order from localStorage
  $effect(() => {
    const storageKey = `svadmin-colorder-${resourceName}`;
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const savedOrder: string[] = JSON.parse(saved);
        const reordered = savedOrder
          .map(id => columns.find(c => c.id === id))
          .filter((c): c is Column => c !== undefined);
        // Add any new columns not in saved order
        const remaining = columns.filter(c => !savedOrder.includes(c.id));
        if (reordered.length > 0) {
          onReorder([...reordered, ...remaining]);
        }
      }
    } catch { /* ignore */ }
  });

  function handleDragStart(e: DragEvent, index: number) {
    dragIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    dropIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  function handleDrop(e: DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) {
      dragIndex = null;
      dropIndex = null;
      return;
    }

    const newColumns = [...columns];
    const [moved] = newColumns.splice(dragIndex, 1);
    newColumns.splice(index, 0, moved);

    // Persist to localStorage
    const storageKey = `svadmin-colorder-${resourceName}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newColumns.map(c => c.id)));
      } catch { /* ignore */ }
    }

    onReorder(newColumns);
    dragIndex = null;
    dropIndex = null;
  }

  function handleDragEnd() {
    dragIndex = null;
    dropIndex = null;
  }
</script>

<tr class="hover:bg-muted/50 data-[state=selected]:bg-muted transition-colors bg-muted/50">
  {#each columns as column, index}
    {@render header(column, index, {
      draggable: true,
      ondragstart: (e: DragEvent) => handleDragStart(e, index),
      ondragover: (e: DragEvent) => handleDragOver(e, index),
      ondrop: (e: DragEvent) => handleDrop(e, index),
      ondragend: handleDragEnd,
      'data-dragging': dragIndex === index,
      'data-drop-target': dropIndex === index && dropIndex !== dragIndex,
      class: `cursor-grab active:cursor-grabbing select-none transition-opacity ${dragIndex === index ? 'opacity-50' : ''} ${dropIndex === index && dropIndex !== dragIndex ? 'border-l-2 border-primary' : ''}`
    })}
  {/each}
</tr>
