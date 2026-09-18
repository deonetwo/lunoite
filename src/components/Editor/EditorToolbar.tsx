import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  FileCode,
  Trash2,
} from 'lucide-react';
import { TableDialog } from './TableDialog';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);

  if (!editor) return null;

  const currentHeading = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'p';

  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  const isTableActive = editor.isActive('table');

  const insertTable = (rows: number, cols: number, withHeaderRow: boolean) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  };

  return (
    <>
      <div
        className="flex flex-wrap items-center gap-1 px-3 py-1.5 border-b border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] text-[#191b1f] dark:text-[#eceef2] text-xs transition-colors select-none"
        role="toolbar"
        aria-label="Editor formatting toolbar"
      >
        {/* Headings Selector */}
        <div className="flex items-center mr-1">
          <label htmlFor="heading-select" className="sr-only">
            Text Style
          </label>
          <select
            id="heading-select"
            value={currentHeading}
            onChange={handleHeadingChange}
            className="h-7 px-2 text-xs font-medium rounded border border-[#e5e3dc] dark:border-[#282b33] bg-transparent text-[#191b1f] dark:text-[#eceef2] focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none cursor-pointer"
          >
            <option value="p" className="bg-[#ffffff] dark:bg-[#17191e] text-[#191b1f] dark:text-[#eceef2]">
              Paragraph
            </option>
            <option value="h1" className="bg-[#ffffff] dark:bg-[#17191e] text-[#191b1f] dark:text-[#eceef2]">
              Heading 1
            </option>
            <option value="h2" className="bg-[#ffffff] dark:bg-[#17191e] text-[#191b1f] dark:text-[#eceef2]">
              Heading 2
            </option>
            <option value="h3" className="bg-[#ffffff] dark:bg-[#17191e] text-[#191b1f] dark:text-[#eceef2]">
              Heading 3
            </option>
          </select>
        </div>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Text Style Buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788] font-semibold'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Bold (Ctrl+B)"
          aria-label="Toggle Bold"
          aria-pressed={editor.isActive('bold')}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Italic (Ctrl+I)"
          aria-label="Toggle Italic"
          aria-pressed={editor.isActive('italic')}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('strike')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Strikethrough"
          aria-label="Toggle Strikethrough"
          aria-pressed={editor.isActive('strike')}
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('code')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Inline Code (`code`)"
          aria-label="Toggle Inline Code"
          aria-pressed={editor.isActive('code')}
        >
          <Code className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Align Left"
          aria-label="Align Left"
        >
          <AlignLeft className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Align Center"
          aria-label="Align Center"
        >
          <AlignCenter className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Align Right"
          aria-label="Align Right"
        >
          <AlignRight className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Lists & Tasks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Bullet List (- item)"
          aria-label="Toggle Bullet List"
          aria-pressed={editor.isActive('bulletList')}
        >
          <List className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Numbered List (1. item)"
          aria-label="Toggle Numbered List"
          aria-pressed={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('taskList')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Task List ([] task)"
          aria-label="Toggle Task List"
          aria-pressed={editor.isActive('taskList')}
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Blocks & Separators */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Quote Block (> quote)"
          aria-label="Toggle Blockquote"
          aria-pressed={editor.isActive('blockquote')}
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Code Block (```)"
          aria-label="Toggle Code Block"
          aria-pressed={editor.isActive('codeBlock')}
        >
          <FileCode className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Horizontal Rule (---)"
          aria-label="Insert Horizontal Rule"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Table Generator & Controls */}
        <button
          type="button"
          onClick={() => setIsTableDialogOpen(true)}
          className={`p-1.5 rounded transition-colors ${
            isTableActive
              ? 'bg-[#2d6a4f]/15 text-[#2d6a4f] dark:bg-[#52b788]/20 dark:text-[#52b788]'
              : 'text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5'
          } focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]`}
          title="Insert Table"
          aria-label="Insert Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>

        {isTableActive && (
          <div className="flex items-center gap-0.5 bg-[#f8f7f4] dark:bg-[#111215] px-1 py-0.5 rounded border border-[#e5e3dc] dark:border-[#282b33]">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="p-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2]"
              title="Add row below"
            >
              +Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="p-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2]"
              title="Add column right"
            >
              +Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="p-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600"
              title="Delete row"
            >
              -Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="p-1 text-[11px] text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600"
              title="Delete column"
            >
              -Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="p-1 text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600"
              title="Delete table"
              aria-label="Delete table"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="w-[1px] h-4 bg-[#e5e3dc] dark:bg-[#282b33] mx-1" aria-hidden="true" />

        {/* Undo / Redo */}
        <div className="flex items-center ml-auto gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <TableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsertTable={insertTable}
      />
    </>
  );
};
