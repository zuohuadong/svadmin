/**
 * Slash command extension for Tiptap
 *
 * Type "/" on an empty line to open a command menu.
 * Uses @tiptap/suggestion under the hood.
 */

import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import type { Editor } from '@tiptap/core';
import { t } from '@svadmin/core';

export interface SlashCommandItem {
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  command: (editor: Editor) => void;
}

/**
 * Default slash command items
 */
export function getDefaultSlashItems(): SlashCommandItem[] {
  return [
    {
      title: t('editor.h1'),
      description: 'Large section heading',
      category: 'Headings',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: t('editor.h2'),
      description: 'Medium section heading',
      category: 'Headings',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: t('editor.h3'),
      description: 'Small section heading',
      category: 'Headings',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: t('editor.bulletList'),
      description: 'Create a bulleted list',
      category: 'Lists',
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: t('editor.orderedList'),
      description: 'Create a numbered list',
      category: 'Lists',
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: t('editor.taskList'),
      description: 'Create a task checklist',
      category: 'Lists',
      command: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
    {
      title: t('editor.blockquote'),
      description: 'Insert a blockquote',
      category: 'Blocks',
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: t('editor.codeBlock'),
      description: 'Insert a code block',
      category: 'Blocks',
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: 'Divider',
      description: 'Insert a horizontal rule',
      category: 'Blocks',
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      title: t('editor.table'),
      description: 'Insert a 3×3 table',
      category: 'Media',
      command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: 'Image',
      description: 'Insert image from URL',
      category: 'Media',
      command: (editor) => {
        const url = window.prompt('Enter image URL:');
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
    },
  ];
}

export interface SlashCommandOptions {
  items?: SlashCommandItem[];
  /** Custom rendering handlers — follows @tiptap/suggestion render interface */
  render?: SuggestionOptions['render'];
}

/**
 * Create a slash command extension.
 *
 * Usage:
 * ```ts
 * import { createSlashCommand } from '@svadmin/editor/extensions/slash-command';
 * const SlashCommand = createSlashCommand();
 * ```
 */
export function createSlashCommand(options: SlashCommandOptions = {}): Extension {
  const items = options.items ?? getDefaultSlashItems();

  return Extension.create({
    name: 'slashCommand',

    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: { editor: Editor; range: { from: number; to: number }; props: SlashCommandItem }) => {
            // Delete the slash and trigger text
            editor.chain().focus().deleteRange(range).run();
            // Execute the command
            props.command(editor);
          },
          items: ({ query }: { query: string }) => {
            return items.filter((item) =>
              item.title.toLowerCase().includes(query.toLowerCase())
            );
          },
          ...(options.render ? { render: options.render } : {}),
        } as Partial<SuggestionOptions>,
      };
    },

    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ];
    },
  });
}
