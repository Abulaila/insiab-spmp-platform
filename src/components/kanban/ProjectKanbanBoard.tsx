'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { ProjectCard } from './ProjectCard';
import BoardSettingsPanel from './BoardSettingsPanel';

interface ProjectKanbanBoardProps {
  className?: string;
  onProjectClick?: (project: any) => void;
}

interface UserKanbanColumn {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  maxWipLimit?: number;
  isCollapsed: boolean;
  statusMapping?: string;
}

interface UserKanbanBoard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  columns: UserKanbanColumn[];
}

export default function ProjectKanbanBoard({ className = '', onProjectClick }: ProjectKanbanBoardProps) {
  const [kanbanData, setKanbanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [userBoard, setUserBoard] = useState<UserKanbanBoard | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const userId = 'default-admin-user'; // TODO: Get from auth context

  // Load user board configuration
  const loadUserBoard = useCallback(async () => {
    try {
      const response = await fetch(`/api/user/kanban/boards?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load user board');
      }

      const boards = await response.json();
      const defaultBoard = boards.find((b: UserKanbanBoard) => b.isDefault) || boards[0];
      setUserBoard(defaultBoard);
    } catch (err) {
      console.error('Error loading user board:', err);
    }
  }, [userId]);

  // Load project kanban data
  const loadKanbanData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects/kanban');
      if (!response.ok) {
        throw new Error('Failed to load project kanban data');
      }

      const data = await response.json();
      setKanbanData(data.columns);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    const { destination, source, draggableId } = result;

    // Dropped outside any droppable area
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    if (!kanbanData) return;

    // Find the project being moved
    const sourceColumn = kanbanData[source.droppableId];
    const destColumn = kanbanData[destination.droppableId];
    const projectToMove = sourceColumn[source.index];

    // Optimistic update
    const newKanbanData = { ...kanbanData };
    
    // Remove from source
    newKanbanData[source.droppableId] = [...sourceColumn];
    newKanbanData[source.droppableId].splice(source.index, 1);
    
    // Add to destination
    newKanbanData[destination.droppableId] = [...destColumn];
    newKanbanData[destination.droppableId].splice(destination.index, 0, projectToMove);

    setKanbanData(newKanbanData);

    // Update project status in backend
    try {
      let newStatus = destination.droppableId;
      let newProgress = projectToMove.progress;

      // Auto-adjust progress based on new status
      if (newStatus === 'completed') {
        newProgress = 100;
      } else if (newStatus === 'planning') {
        newProgress = Math.min(newProgress, 10);
        newStatus = 'active'; // Planning is still "active" status, just low progress
      } else if (newStatus === 'active' && newProgress < 10) {
        newProgress = 10; // Active projects should be at least 10%
      }

      const response = await fetch('/api/projects/kanban', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: draggableId,
          newStatus,
          newProgress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update project status');
      }

      // Refresh data to ensure consistency
      loadKanbanData();
    } catch (err) {
      console.error('Error updating project status:', err);
      // Revert optimistic update on error
      loadKanbanData();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    loadUserBoard();
    loadKanbanData();
  }, [loadUserBoard, loadKanbanData]);

  if (loading) {
    return (
      <div className={`${className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">Loading project board...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Error Loading Projects</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
            <button
              onClick={loadKanbanData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!kanbanData) {
    return null;
  }

  return (
    <div className={`${className} min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}>
      {/* Header with Stats */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {userBoard?.name || 'Project Board'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {userBoard?.description || 'Manage and track all projects by status'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Board settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={loadKanbanData}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Refresh board"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          {stats && userBoard && (
            <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${userBoard.columns.length}, 1fr)` }}>
              {userBoard.columns.map((column) => (
                <div key={column.id} className="text-center">
                  <div className="text-2xl mb-1">{column.icon || '📋'}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {stats[column.statusMapping] || 0}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {column.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Kanban Board */}
      {userBoard && (
        <div className="px-6 pb-8">
          <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]" style={{ scrollbarWidth: 'thin' }}>
              {userBoard.columns.map((column) => {
                const columnId = column.statusMapping || 'active';
                const hexToRgb = (hex: string) => {
                  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                  return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                  } : null;
                };
                
                const rgb = hexToRgb(column.color);
                const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : 'rgba(100, 116, 139, 0.1)';
                const borderColor = column.color;

                return (
                  <div key={column.id} className="flex-shrink-0 w-80">
                    {/* Column Header */}
                    <div 
                      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-t-2xl border-t-4 border-x border-slate-200/60 dark:border-slate-700/60 p-4"
                      style={{ borderTopColor: borderColor }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{column.icon || '📋'}</span>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{column.name}</h3>
                            {column.maxWipLimit && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                WIP Limit: {column.maxWipLimit}
                              </p>
                            )}
                          </div>
                        </div>
                        <div 
                          className="px-2 py-1 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: column.color }}
                        >
                          {kanbanData[columnId]?.length || 0}
                        </div>
                      </div>
                    </div>

                    {/* Column Body */}
                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="border-x border-b border-slate-200/60 dark:border-slate-700/60 rounded-b-2xl p-4 min-h-[500px] transition-all duration-200"
                          style={{
                            backgroundColor: snapshot.isDraggingOver 
                              ? 'rgba(59, 130, 246, 0.1)' 
                              : bgColor
                          }}
                        >
                          {/* WIP Limit Warning */}
                          {column.maxWipLimit && kanbanData[columnId]?.length > column.maxWipLimit && (
                            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                                ⚠️ WIP limit exceeded ({kanbanData[columnId]?.length}/{column.maxWipLimit})
                              </p>
                            </div>
                          )}

                          <div className="space-y-4">
                            {kanbanData[columnId]?.map((project: any, index: number) => (
                              <ProjectCard
                                key={project.id}
                                project={project}
                                index={index}
                                onProjectClick={onProjectClick}
                                isDragging={isDragging}
                              />
                            ))}
                            {provided.placeholder}
                          </div>

                          {/* Empty State */}
                          {(!kanbanData[columnId] || kanbanData[columnId].length === 0) && (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                              <div className="text-4xl mb-2 opacity-50">{column.icon || '📋'}</div>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                No projects in {column.name.toLowerCase()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* Settings Panel */}
      <BoardSettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userId={userId}
        onBoardUpdated={(board) => {
          setUserBoard(board);
          loadKanbanData(); // Refresh project data
        }}
      />
    </div>
  );
}