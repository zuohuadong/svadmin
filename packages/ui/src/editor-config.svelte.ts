/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component } from 'svelte';

let registeredEditor: Component<any> | undefined = $state(undefined);

/**
 * Register a global Rich Text Editor component.
 * This decouples @svadmin/ui from @svadmin/editor, making the editor completely optional.
 * 
 * Usage:
 * ```ts
 * import { Editor } from '@svadmin/editor';
 * import { setRichTextEditor } from '@svadmin/ui';
 * 
 * setRichTextEditor(Editor);
 * ```
 */
export function setRichTextEditor(editorComponent: Component<any>): void {
  registeredEditor = editorComponent;
}

export function getRichTextEditor(): Component<any> | undefined {
  return registeredEditor;
}
