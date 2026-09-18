import React, { useState } from 'react';
import { ReferenceCard } from '../../types/shelf';
import { ArrowRight, Edit3, Trash2, Copy, Check, Tag } from 'lucide-react';

interface ShelfCardProps {
  card: ReferenceCard;
  onInsert: (content: string) => void;
  onEdit: (card: ReferenceCard) => void;
  onDelete: (id: string) => void;
}

export const ShelfCard: React.FC<ShelfCardProps> = ({ card, onInsert, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(card.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'star':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      case 'snippet':
        return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30';
      case 'template':
        return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-stone-500/15 text-stone-800 dark:text-stone-300 border-stone-500/30';
    }
  };

  const categoryLabel = {
    star: 'STAR Story',
    snippet: 'Code Snippet',
    template: 'Template',
    note: 'Reference',
  }[card.category] || 'Note';

  return (
    <div
      className="group relative rounded-lg border border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] p-3 shadow-xs hover:border-[#2d6a4f]/50 dark:hover:border-[#52b788]/50 transition-all text-[#191b1f] dark:text-[#eceef2]"
      role="article"
      aria-label={`Reference card: ${card.title}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-xs font-semibold text-[#191b1f] dark:text-[#eceef2] line-clamp-1">
          {card.title}
        </h3>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-medium shrink-0 ${getCategoryBadgeClass(
            card.category
          )}`}
        >
          {categoryLabel}
        </span>
      </div>

      <p className="text-xs text-[#59606d] dark:text-[#9ba2b0] line-clamp-3 font-mono text-[11px] bg-[#f8f7f4] dark:bg-[#111215] p-2 rounded border border-[#e5e3dc]/50 dark:border-[#282b33]/50 mb-2.5 whitespace-pre-wrap select-text">
        {card.content}
      </p>

      {card.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mb-2.5">
          <Tag className="w-3 h-3 text-[#59606d] dark:text-[#9ba2b0]" aria-hidden="true" />
          {card.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-[#59606d] dark:text-[#9ba2b0]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#e5e3dc]/60 dark:border-[#282b33]/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Copy card text"
            aria-label="Copy card text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#2d6a4f] dark:text-[#52b788]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onEdit(card)}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-[#191b1f] dark:hover:text-[#eceef2] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Edit card"
            aria-label="Edit card"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(card.id)}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:text-red-600 hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Delete card"
            aria-label="Delete card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* The Arrow Button to insert into the main document body */}
        <button
          type="button"
          onClick={() => onInsert(card.content)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#2d6a4f]/10 hover:bg-[#2d6a4f] text-[#2d6a4f] hover:text-white dark:bg-[#52b788]/15 dark:hover:bg-[#52b788] dark:text-[#52b788] dark:hover:text-[#111215] transition-all focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
          title="Insert into document at cursor"
        >
          <span>Insert</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
