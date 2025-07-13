'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import type { KanbanCard as KanbanCardType } from './KanbanBoard';

interface KanbanCardProps {
  card: KanbanCardType;
  index: number;
  onClick?: () => void;
  onCardDeleted: (cardId: string) => void;
  onCardUpdated: (card: KanbanCardType) => void;
  isDragging?: boolean;
}

const PRIORITY_COLORS = {
  high: 'bg-gradient-to-r from-red-500 to-pink-500',
  medium: 'bg-gradient-to-r from-amber-500 to-orange-500',
  low: 'bg-gradient-to-r from-emerald-500 to-green-500'
};

const PRIORITY_INDICATORS = {
  high: '🔴',
  medium: '🟡', 
  low: '🟢'
};

export function KanbanCard({ 
  card, 
  index, 
  onClick, 
  onCardDeleted, 
  onCardUpdated,
  isDragging = false 
}: KanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();
  const isDueSoon = card.dueDate && !isOverdue && 
    new Date(card.dueDate).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000;

  const handleQuickEdit = async (field: string, value: any) => {
    try {
      const response = await fetch(`/api/kanban/cards/${card.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });

      if (!response.ok) {
        throw new Error('Failed to update card');
      }

      const updatedCard = await response.json();
      onCardUpdated(updatedCard);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) return;

    try {
      const response = await fetch(`/api/kanban/cards/${card.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      onCardDeleted(card.id);
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white dark:bg-slate-700 rounded-xl border border-slate-200/60 dark:border-slate-600/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group ${
              snapshot.isDragging 
                ? 'rotate-3 shadow-2xl scale-105 ring-2 ring-blue-500/50' 
                : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick?.()}
          >
            {card.coverColor && (
              <div 
                className="h-2 rounded-t-xl"
                style={{ backgroundColor: card.coverColor }}
              />
            )}

            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight flex-1">
                  {card.title}
                </h3>
                
                {(isHovered || showMenu) && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                      }}
                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1 z-20 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                        >
                          Edit Card
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete Card
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {card.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {card.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {card.priority && (
                    <span className="text-xs">
                      {PRIORITY_INDICATORS[card.priority]}
                    </span>
                  )}

                  {card.labels && card.labels.length > 0 && (
                    <div className="flex gap-1">
                      {card.labels.slice(0, 3).map((label, idx) => (
                        <span
                          key={idx}
                          className="inline-block w-2 h-2 rounded-full bg-blue-500"
                          title={label}
                        />
                      ))}
                      {card.labels.length > 3 && (
                        <span className="text-xs text-slate-500">+{card.labels.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {card.dueDate && (
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      isOverdue 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : isDueSoon
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {new Date(card.dueDate).toLocaleDateString()}
                    </span>
                  )}

                  {card.assignee && (
                    <div 
                      className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      title={card.assignee.name}
                    >
                      {card.assignee.avatar || card.assignee.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}