'use client';

import { useState } from 'react';
import type { KanbanColumnType } from './KanbanBoard';

interface AddColumnProps {
  boardId: string;
  onColumnAdded: (column: KanbanColumnType) => void;
}

export function AddColumn({ boardId, onColumnAdded }: AddColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#64748b');
  const [isLoading, setIsLoading] = useState(false);

  const presetColors = [
    '#64748b', // Slate
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#f97316', // Orange
    '#06b6d4'  // Cyan
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          color,
          boardId,
          order: 999 // Will be positioned at the end
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create column');
      }

      const newColumn = await response.json();
      onColumnAdded(newColumn);
      setName('');
      setColor('#64748b');
      setIsAdding(false);
    } catch (error) {
      console.error('Error creating column:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setColor('#64748b');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  if (!isAdding) {
    return (
      <div className="flex-shrink-0 w-80">
        <button
          onClick={() => setIsAdding(true)}
          className="group w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold">Add another list</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
        <form onSubmit={handleSubmit} className="p-4">
          <div 
            className="h-2 rounded-t-xl mb-4 -mx-4 -mt-4"
            style={{ backgroundColor: color }}
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter list title..."
            className="w-full text-sm font-bold bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 mb-4"
            autoFocus
          />

          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Choose color</label>
            <div className="flex gap-2 flex-wrap">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    color === presetColor 
                      ? 'border-slate-400 dark:border-slate-300 scale-110 shadow-lg' 
                      : 'border-slate-200 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add List'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-xs font-mono">⌘ Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-xs font-mono">Esc</kbd> to cancel
          </div>
        </form>
      </div>
    </div>
  );
}