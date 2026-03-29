/**
 * @svadmin/editor — Editor factory
 *
 * Creates and manages a Tiptap editor instance with Svelte 5 reactivity.
 */

import { Editor, type EditorOptions } from '@tiptap/core';
import { fullPreset, minimalPreset, prosePreset, type EditorPresetOptions } from './extensions/index.js';
import type { AnyExtension } from '@tiptap/core';

export interface SvadminEditorOptions {
  /** Initial HTML content */
  content?: string;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Whether the editor is editable */
  editable?: boolean;
  /** Autofocus on mount */
  autofocus?: boolean | 'start' | 'end';
  /** Maximum character count (0 = unlimited) */
  maxLength?: number;
  /** Extension preset: 'full' | 'minimal' | 'prose' */
  preset?: 'full' | 'minimal' | 'prose';
  /** Custom extensions (overrides preset) */
  extensions?: AnyExtension[];
  /** Preset options */
  presetOptions?: EditorPresetOptions;
  /** Image upload handler */
  onUpload?: (file: File) => Promise<string>;
  /** Called on every content update */
  onUpdate?: (html: string) => void;
  /** Additional Tiptap EditorOptions overrides */
  editorProps?: Partial<EditorOptions>;
}

/**
 * Create a Tiptap editor instance with svadmin defaults.
 */
export function createSvadminEditor(
  element: HTMLElement,
  options: SvadminEditorOptions = {}
): Editor {
  const {
    content = '',
    placeholder = '',
    editable = true,
    autofocus = false,
    maxLength = 0,
    preset = 'full',
    extensions: customExtensions,
    presetOptions,
    onUpdate,
    editorProps,
  } = options;

  // Resolve extensions
  let extensions: AnyExtension[];
  if (customExtensions) {
    extensions = customExtensions;
  } else {
    const opts: EditorPresetOptions = {
      placeholder,
      maxLength,
      ...presetOptions,
    };

    switch (preset) {
      case 'minimal':
        extensions = minimalPreset(opts);
        break;
      case 'prose':
        extensions = prosePreset(opts);
        break;
      case 'full':
      default:
        extensions = fullPreset(opts);
    }
  }

  const editor = new Editor({
    element,
    extensions,
    content,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
      ...editorProps?.editorProps,
    },
    onUpdate({ editor: e }) {
      onUpdate?.(e.getHTML());
    },
    ...editorProps,
  });

  return editor;
}
