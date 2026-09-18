import React, { useState, useEffect, useRef } from 'react';
import { X, Table as TableIcon } from 'lucide-react';

interface TableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number, withHeaderRow: boolean) => void;
}

export const TableDialog: React.FC<TableDialogProps> = ({ isOpen, onClose, onInsertTable }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const rowsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => rowsInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRows = Math.max(1, Math.min(20, rows));
    const parsedCols = Math.max(1, Math.min(10, cols));
    onInsertTable(parsedRows, parsedCols, withHeader);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-dialog-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-sm rounded-lg border border-[#e5e3dc] dark:border-[#282b33] bg-[#ffffff] dark:bg-[#17191e] p-5 shadow-lg text-[#191b1f] dark:text-[#eceef2] transition-all"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e3dc] dark:border-[#282b33]">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-[#2d6a4f] dark:text-[#52b788]" aria-hidden="true" />
            <h2 id="table-dialog-title" className="font-medium text-sm">
              Insert Table
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[#59606d] dark:text-[#9ba2b0] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            aria-label="Close table dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="table-rows" className="block text-xs font-medium text-[#59606d] dark:text-[#9ba2b0] mb-1">
                Rows (1 to 20)
              </label>
              <input
                id="table-rows"
                ref={rowsInputRef}
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={e => setRows(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2.5 py-1.5 text-sm rounded border border-[#e5e3dc] dark:border-[#282b33] bg-transparent focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="table-cols" className="block text-xs font-medium text-[#59606d] dark:text-[#9ba2b0] mb-1">
                Columns (1 to 10)
              </label>
              <input
                id="table-cols"
                type="number"
                min={1}
                max={10}
                value={cols}
                onChange={e => setCols(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2.5 py-1.5 text-sm rounded border border-[#e5e3dc] dark:border-[#282b33] bg-transparent focus:border-[#2d6a4f] dark:focus:border-[#52b788] focus:outline-none"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-[#59606d] dark:text-[#9ba2b0] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={withHeader}
              onChange={e => setWithHeader(e.target.checked)}
              className="w-4 h-4 rounded accent-[#2d6a4f] dark:accent-[#52b788]"
            />
            Include top header row
          </label>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e5e3dc] dark:border-[#282b33]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded border border-[#e5e3dc] dark:border-[#282b33] hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-medium rounded bg-[#2d6a4f] hover:bg-[#24553f] dark:bg-[#52b788] dark:hover:bg-[#429d73] text-white dark:text-[#111215] transition-colors focus-visible:outline-2 focus-visible:outline-[#2d6a4f] dark:focus-visible:outline-[#52b788]"
            >
              Insert Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
