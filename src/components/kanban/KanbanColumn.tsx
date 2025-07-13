'use client';

import { useState, useRef } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { KanbanCard } from './KanbanCard';
import { AddCard } from './AddCard';
import { ColumnHeader } from './ColumnHeader';
import type { KanbanColumnType, KanbanCard as KanbanCardType } from './KanbanBoard';

interface KanbanColumnProps {
  column: KanbanColumnType;
  index: number;
  onCardClick?: (card: KanbanCardType) => void;
  onColumnUpdate: (column: KanbanColumnType) => void;
  isDragging?: boolean;
}

export function KanbanColumn({ 
  column, 
  index, 
  onCardClick, 
  onColumnUpdate,
  isDragging = false 
}: KanbanColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const handleCardAdded = (newCard: KanbanCardType) => {
    onColumnUpdate({
      ...column,
      cards: [...column.cards, newCard]
    });
    setIsAddingCard(false);
  };

  const handleCardDeleted = (cardId: string) => {
    onColumnUpdate({
      ...column,
      cards: column.cards.filter(card => card.id !== cardId)
    });
  };

  const handleCardUpdated = (updatedCard: KanbanCardType) => {
    onColumnUpdate({
      ...column,
      cards: column.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    });
  };

  const isOverWipLimit = column.maxWipLimit && column.cards.length > column.maxWipLimit;

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`flex-shrink-0 w-80 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-all duration-200 ${
              snapshot.isDragging 
                ? 'rotate-3 shadow-2xl scale-105 ring-2 ring-blue-500/50' 
                : 'hover:shadow-md'
            } ${isOverWipLimit ? 'ring-2 ring-red-500/50' : ''}`}
          >
            <ColumnHeader
              column={column}
              onColumnUpdate={onColumnUpdate}
              dragHandleProps={provided.dragHandleProps}
              isEditingName={isEditingName}
              setIsEditingName={setIsEditingName}
            />

            {!column.isCollapsed && (
              <div className="flex-1 px-4 pb-4">
                <Droppable droppableId={column.id} type="card">
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[400px] space-y-3 transition-all duration-200 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-2 -m-2' 
                            : ''
                        }`}
                      >
                        {isOverWipLimit && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                                WIP Limit Exceeded ({column.cards.length}/{column.maxWipLimit})
                              </span>
                            </div>
                          </div>
                        )}

                        {column.cards.map((card, cardIndex) => (
                          <KanbanCard
                            key={card.id}
                            card={card}
                            index={cardIndex}
                            onClick={() => onCardClick?.(card)}
                            onCardDeleted={handleCardDeleted}
                            onCardUpdated={handleCardUpdated}
                            isDragging={isDragging}
                          />
                        ))}

                        {provided.placeholder}

                        {isAddingCard ? (
                          <AddCard
                            columnId={column.id}
                            onCardAdded={handleCardAdded}
                            onCancel={() => setIsAddingCard(false)}
                          />
                        ) : (
                          <button
                            onClick={() => setIsAddingCard(true)}
                            className="group w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span className="font-medium">Add a card</span>
                            </div>
                          </button>
                        )}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
}