'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { BoardHeader } from './BoardHeader';
import { AddColumn } from './AddColumn';

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  order: number;
  position: number;
  columnId: string;
  projectId?: string;
  assigneeId?: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  labels?: string[];
  coverColor?: string;
  coverImage?: string;
  checklist?: any;
  attachments?: any;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
    priority?: 'high' | 'medium' | 'low';
  };
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface KanbanColumnType {
  id: string;
  name: string;
  color?: string;
  order: number;
  maxWipLimit?: number;
  isCollapsed: boolean;
  cards: KanbanCard[];
}

export interface KanbanBoardType {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  order: number;
  columns: KanbanColumnType[];
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

interface KanbanBoardProps {
  boardId?: string;
  projectId?: string;
  onCardClick?: (card: KanbanCard) => void;
  className?: string;
}

export default function KanbanBoard({ 
  boardId, 
  projectId, 
  onCardClick,
  className = '' 
}: KanbanBoardProps) {
  const [board, setBoard] = useState<KanbanBoardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load board data
  const loadBoard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/kanban/boards';
      if (boardId) {
        url = `/api/kanban/boards/${boardId}`;
      } else if (projectId) {
        url = `/api/kanban/boards?projectId=${projectId}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load board');
      }

      const data = await response.json();
      
      if (Array.isArray(data)) {
        // If multiple boards, take the first one or create default
        if (data.length > 0) {
          setBoard(data[0]);
        } else {
          // Create default board for project
          await createDefaultBoard();
        }
      } else {
        setBoard(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [boardId, projectId]);

  // Create default board
  const createDefaultBoard = async () => {
    try {
      const response = await fetch('/api/kanban/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Project Board',
          description: 'Default project board',
          projectId,
          createdBy: 'default-admin-user' // Use default admin user
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create default board');
      }

      const newBoard = await response.json();
      setBoard(newBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    }
  };

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId, type } = result;

    // Dropped outside any droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!board) return;

    if (type === 'column') {
      // Handle column reordering
      const newColumns = Array.from(board.columns);
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);

      // Update order values
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index
      }));

      // Optimistic update
      setBoard({ ...board, columns: updatedColumns });

      // Persist to backend
      try {
        await fetch('/api/kanban/columns', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            columns: updatedColumns.map(col => ({ id: col.id, order: col.order }))
          })
        });
      } catch (err) {
        console.error('Failed to reorder columns:', err);
        // Revert on error
        loadBoard();
      }
    } else {
      // Handle card movement
      const sourceColumn = board.columns.find(col => col.id === source.droppableId);
      const destColumn = board.columns.find(col => col.id === destination.droppableId);

      if (!sourceColumn || !destColumn) return;

      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = sourceColumn === destColumn ? sourceCards : Array.from(destColumn.cards);

      // Remove from source
      const [movedCard] = sourceCards.splice(source.index, 1);

      // Add to destination
      if (sourceColumn === destColumn) {
        sourceCards.splice(destination.index, 0, movedCard);
      } else {
        destCards.splice(destination.index, 0, { ...movedCard, columnId: destColumn.id });
      }

      // Calculate new positions
      const calculatePositions = (cards: KanbanCard[]) => {
        return cards.map((card, index) => ({
          ...card,
          position: (index + 1) * 1000
        }));
      };

      const updatedSourceCards = calculatePositions(sourceCards);
      const updatedDestCards = sourceColumn === destColumn ? updatedSourceCards : calculatePositions(destCards);

      // Update board state
      const updatedColumns = board.columns.map(col => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: updatedSourceCards };
        } else if (col.id === destColumn.id && sourceColumn !== destColumn) {
          return { ...col, cards: updatedDestCards };
        }
        return col;
      });

      // Optimistic update
      setBoard({ ...board, columns: updatedColumns });

      // Persist to backend
      try {
        const cardsToUpdate = sourceColumn === destColumn 
          ? updatedSourceCards 
          : [...updatedSourceCards, ...updatedDestCards];

        await fetch('/api/kanban/cards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cards: cardsToUpdate.map(card => ({
              id: card.id,
              columnId: card.columnId,
              position: card.position
            }))
          })
        });
      } catch (err) {
        console.error('Failed to move card:', err);
        // Revert on error
        loadBoard();
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const containerClass = `${className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`;

  if (loading) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Board</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={loadBoard}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <div className={containerClass}>
      <BoardHeader 
        board={board} 
        onBoardUpdate={setBoard}
        onRefresh={loadBoard}
      />
      
      <div className="px-6 pb-8">
        <DragDropContext 
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <Droppable 
            droppableId="board" 
            direction="horizontal" 
            type="column"
          >
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex gap-6 overflow-x-auto pb-4 min-h-[600px] transition-all duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                } ${isDragging ? 'select-none' : ''}`}
                style={{ scrollbarWidth: 'thin' }}
              >
                {board.columns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={index}
                    onCardClick={onCardClick}
                    onColumnUpdate={(updatedColumn) => {
                      const updatedColumns = board.columns.map(col =>
                        col.id === updatedColumn.id ? updatedColumn : col
                      );
                      setBoard({ ...board, columns: updatedColumns });
                    }}
                    isDragging={isDragging}
                  />
                ))}
                
                {provided.placeholder}
                
                <AddColumn 
                  boardId={board.id}
                  onColumnAdded={(newColumn) => {
                    setBoard({
                      ...board,
                      columns: [...board.columns, newColumn]
                    });
                  }}
                />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}