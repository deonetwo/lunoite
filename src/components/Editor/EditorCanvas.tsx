import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { TextAlign } from '@tiptap/extension-text-align';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { Extension, wrappingInputRule } from '@tiptap/core';

import { EditorToolbar } from './EditorToolbar';
import { BubbleMenu } from './BubbleMenu';

interface EditorCanvasProps {
  initialContent: string;
  onChange: (markdown: string) => void;
  onSave: () => void;
  onClipSelection: (text: string) => void;
  isZenMode: boolean;
  onEditorReady?: (editorInstance: unknown) => void;
}

// Custom input rule for typing "[] " or "[ ] " to create a task list
const TaskListInputRule = Extension.create({
  name: 'taskListInputRule',
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*(\[ \]|\[\])\s$/,
        type: this.editor.schema.nodes.taskList,
      }),
    ];
  },
});

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  initialContent,
  onChange,
  onSave,
  onClipSelection,
  isZenMode,
  onEditorReady,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        bulletListMarker: '-',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TaskListInputRule,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Write your story, technical notes, or draft...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none max-w-none text-[#191b1f] dark:text-[#eceef2]',
        spellcheck: 'true',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const storage = ed.storage as unknown as { markdown?: { getMarkdown: () => string } };
      const md = storage.markdown ? storage.markdown.getMarkdown() : ed.getText();
      onChange(md);
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Global Ctrl+S listener
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    },
    [onSave]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8f7f4] dark:bg-[#111215] overflow-y-auto transition-colors">
      {/* Top Toolbar is hidden in Zen Mode */}
      {!isZenMode && <EditorToolbar editor={editor} />}

      {/* Floating Bubble Menu on text selection */}
      <BubbleMenu editor={editor} onClipSelection={onClipSelection} />

      {/* Centered Document Canvas (Paper Sheet) */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex justify-center">
        <div
          className={`w-full max-w-3xl transition-all duration-300 ${
            isZenMode
              ? 'bg-transparent py-4 sm:py-8'
              : 'bg-[#ffffff] dark:bg-[#17191e] border border-[#e5e3dc] dark:border-[#282b33] rounded-lg shadow-xs px-6 sm:px-12 py-8 sm:py-14 my-2'
          }`}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};
