'use client';

import { useState } from 'react';
import type { KanbanCard } from './KanbanBoard';

interface AddCardProps {
  columnId: string;
  onCardAdded: (card: KanbanCard) => void;
  onCancel: () => void;
}

export function AddCard({ columnId, onCardAdded, onCancel }: AddCardProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | ''>('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/kanban/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          columnId,
          priority: priority || undefined,
          dueDate: dueDate || undefined,
          createdBy: 'default-admin-user'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create card');
      }

      const newCard = await response.json();
      onCardAdded(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm">
      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a title for this card..."
          className="w-full text-sm font-medium bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none"
          rows={2}
          autoFocus
        />

        {!showAdvanced && (
          <button
            type="button"
            onClick={() => setShowAdvanced(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mt-2"
          >
            + Add details
          </button>
        )}

        {showAdvanced && (
          <div className="mt-3 space-y-3 border-t border-slate-200 dark:border-slate-600 pt-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="w-full text-sm bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              rows={3}
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                >
                  <option value="">No priority</option>
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              - Hide details
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              'Add Card'
            )}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-xs font-mono">⌘ Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-xs font-mono">Esc</kbd> to cancel
        </div>
      </form>
    </div>
  );
}