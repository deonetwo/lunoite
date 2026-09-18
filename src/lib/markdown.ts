import { DocumentStats } from '../types/editor';

export const STARTER_MARKDOWN = `# Welcome to lunoite

A lightweight, distraction-free Markdown workspace designed for clarity, focus, and clean typography.

## Quick Start

You are working in a rendered WYSIWYG editor. There is no split-screen code view or compilation delay. What you write formats immediately in place.

- [x] Type \`# \` to start a major heading
- [x] Type \`- \` or \`* \` for bullet lists
- [x] Type \`[] \` or \`- [ ] \` for interactive task lists
- [ ] Try creating your own reference card on the right dock

### Key Capabilities

1. **Inline Formatting**: Type \`**bold**\`, \`*italic*\`, or \`\` \`code\` \`\` inline, and formatting applies immediately.
2. **Native File System**: Press **Ctrl+S** (or **Cmd+S**) to save changes directly back to your local \`.md\` file without repeated file save prompts.
3. **Lateral Reference Shelf**: Open the shelf panel to keep snippets, research citations, and STAR stories close at hand without cluttering the document body.

> Focus is not about what you add to the page. Focus is about what you choose not to let distract you.

### Sample Table

| Feature | Engine | Storage |
| :--- | :--- | :--- |
| WYSIWYG Parser | Tiptap & ProseMirror | Native Local Disk |
| Lateral Shelf | React 19 State | Local Storage Fallback |
| Design System | Tailwind CSS v4 | Dark and Light Themes |

### Code Demonstration

\`\`\`typescript
interface NoteWorkspace {
  name: string;
  wordCount: number;
  isFocused: boolean;
}

export function calculateReadTime(words: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(words / wordsPerMinute);
}
\`\`\`

Start typing anywhere on this paper canvas to begin your notes.
`;

export function computeStats(text: string): DocumentStats {
  const cleanText = text.trim();
  if (!cleanText) {
    return { words: 0, characters: 0, readingTimeMinutes: 0, lines: 0 };
  }

  const words = cleanText.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const lines = text.split('\n').length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, characters, readingTimeMinutes, lines };
}

export function downloadMarkdownFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.md') ? filename : `${filename}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
