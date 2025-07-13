'use client';

import { useState } from 'react';
import type { KanbanBoardType } from './KanbanBoard';

interface BoardHeaderProps {
  board: KanbanBoardType;
  onBoardUpdate: (board: KanbanBoardType) => void;
  onRefresh: () => void;
}

export function BoardHeader({ board, onBoardUpdate, onRefresh }: BoardHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(board.name);
  const [showSettings, setShowSettings] = useState(false);

  const handleNameUpdate = async () => {
    if (newName.trim() === board.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/kanban/boards/${board.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update board name');
      }

      const updatedBoard = await response.json();
      onBoardUpdate(updatedBoard);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating board name:', error);
      setNewName(board.name); // Revert on error
      setIsEditingName(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameUpdate();
    } else if (e.key === 'Escape') {
      setNewName(board.name);
      setIsEditingName(false);
    }
  };

  const totalCards = board.columns.reduce((sum, col) => sum + col.cards.length, 0);
  const completedCards = board.columns
    .filter(col => col.name.toLowerCase().includes('done') || col.name.toLowerCase().includes('complete'))
    .reduce((sum, col) => sum + col.cards.length, 0);

  return (
    <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>

            <div>
              {isEditingName ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={handleNameUpdate}
                  onKeyDown={handleKeyPress}
                  className="text-2xl font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 -mx-2 -my-1"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-2xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
                >
                  {board.name}
                </button>
              )}
              
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {totalCards} cards
                </span>
                {totalCards > 0 && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {completedCards} completed ({Math.round((completedCards / totalCards) * 100)}%)
                    </span>
                  </>
                )}
                {board.project && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {board.project.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalCards > 0 && (
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="url(#gradient-progress)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 - (completedCards / totalCards) * 2 * Math.PI * 20}`}
                    className="drop-shadow-sm"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {Math.round((completedCards / totalCards) * 100)}%
                  </span>
                </div>
              </div>
            )}

            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                {board.creator.avatar || board.creator.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh board"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Board settings"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showSettings && (
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg py-2 z-20 min-w-[200px]">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      Board Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      Export Board
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                      Archive Board
                    </button>
                    <hr className="my-2 border-slate-200 dark:border-slate-600" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Delete Board
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}