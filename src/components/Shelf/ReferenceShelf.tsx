import React, { useState } from 'react';
import { ReferenceCard, CardCategory } from '../../types/shelf';
import { ShelfCard } from './ShelfCard';
import { NewCardModal } from './NewCardModal';
import {
  X,
  Plus,
  Search,
  BookOpen,
  Filter,
} from 'lucide-react';

interface ReferenceShelfProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ReferenceCard[];
  onInsertCard: (content: string) => void;
  onAddCard: (card: Omit<ReferenceCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateCard: (id: string, card: Omit<ReferenceCard, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteCard: (id: string) => void;
  clipText?: string;
  onClearClipText?: () => void;
}

export const ReferenceShelf: React.FC<ReferenceShelfProps> = ({
  isOpen,
  onClose,
  cards,
  onInsertCard,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  clipText,
  onClearClipText,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | CardCategory>('all');
  const [editingCard, setEditingCard] = useState<ReferenceCard | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // If clipText is passed, automatically open the modal
  React.useEffect(() => {
    if (clipText) {
      setIsNewModalOpen(true);
    }
  }, [clipText]);

  if (!isOpen) return null;

  const categories: { key: 'all' | CardCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'star', label: 'STAR' },
    { key: 'snippet', label: 'Snippets' },
    { key: 'template', label: 'Templates' },
    { key: 'note', label: 'Notes' },
  ];

  const filteredCards = cards.filter(card => {
    const matchesCategory = selectedCategory === 'all' || card.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleModalSave = (
    cardData: Omit<ReferenceCard, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      onUpdateCard(id, cardData);
    } else {
      onAddCard(cardData);
    }
    if (onClearClipText) {
      onClearClipText();
    }
  };

  const handleModalClose = () => {
    setIsNewModalOpen(false);
    setEditingCard(null);
    if (onClearClipText) {
      onClearClipText();
    }
  };

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-88 md:w-96 bg-[#ffffff] dark:bg-[#17191e] border-l border-[#e5e3dc] dark:border-[#282b33] shadow-xl flex flex-col transition-transform duration-200 ease-in-out text-[#191b1f] dark:text-[#eceef2]"
      aria-label="Reference Shelf"
    >
      {/* Shelf Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-[#e5e3dc] dark:border-[#282b33]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2d6a4f] dark:text-[#52b788]" aria-hidden="true" />
          <h2 className="font-semibold text-sm">Reference Shelf</h2>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#59606d] dark:text-[#9ba2b0] font-mono">
            {cards.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditingCard(null);
              setIsNewModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#2d6a4f] dark:bg-[#52b788] text-white dark:text-[#111215] hover:bg-[#24553f] dark:hover:bg-[#429d73] transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            title="Create new card"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Card</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            aria-label="Close reference shelf"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-[#e5e3dc] dark:border-[#282b33]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#59606d] dark:text-[#9ba2b0]" />
          <input
            type="text"
            placeholder="Search cards, tags, or content..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#e5e3dc] dark:border-[#282b33] bg-[#f8f7f4] dark:bg-[#111215] focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1">
          <Filter className="w-3 h-3 text-[#59606d] dark:text-[#9ba2b0] shrink-0 mr-1" aria-hidden="true" />
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2 py-0.5 text-[11px] rounded transition-colors shrink-0 font-medium ${
                selectedCategory === cat.key
                  ? 'bg-[#2d6a4f] text-white dark:bg-[#52b788] dark:text-[#111215]'
                  : 'bg-black/5 dark:bg-white/5 text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#f8f7f4]/60 dark:bg-[#111215]/60">
        {filteredCards.length > 0 ? (
          filteredCards.map(card => (
            <ShelfCard
              key={card.id}
              card={card}
              onInsert={onInsertCard}
              onEdit={c => {
                setEditingCard(c);
                setIsNewModalOpen(true);
              }}
              onDelete={onDeleteCard}
            />
          ))
        ) : (
          <div className="py-12 text-center text-xs text-[#59606d] dark:text-[#9ba2b0] px-4">
            <p className="font-medium text-sm mb-1 text-[#191b1f] dark:text-[#eceef2]">
              No reference cards found
            </p>
            <p>
              {cards.length === 0
                ? "Click '+ New Card' to add snippets, STAR stories, or templates."
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        )}
      </div>

      {/* New/Edit Modal */}
      <NewCardModal
        isOpen={isNewModalOpen}
        initialCard={editingCard}
        initialContent={clipText}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </aside>
  );
};
