'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface UserKanbanColumn {
  id: string;
  name: string;
  color: string;
  icon?: string;
  order: number;
  maxWipLimit?: number;
  isCollapsed: boolean;
  statusMapping?: string;
  settings?: any;
}

interface UserKanbanBoard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  templateId?: string;
  settings?: any;
  columns: UserKanbanColumn[];
  template?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface BoardTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  methodology?: string;
  columns: any[];
}

interface BoardSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onBoardUpdated?: (board: UserKanbanBoard) => void;
}

export default function BoardSettingsPanel({ 
  isOpen, 
  onClose, 
  userId,
  onBoardUpdated 
}: BoardSettingsPanelProps) {
  const [userBoards, setUserBoards] = useState<UserKanbanBoard[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<UserKanbanBoard | null>(null);
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'boards' | 'columns' | 'templates'>('boards');
  
  // Form states
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [editingColumn, setEditingColumn] = useState<UserKanbanColumn | null>(null);

  // Load user boards
  const loadUserBoards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/kanban/boards?userId=${userId}`);
      if (response.ok) {
        const boards = await response.json();
        setUserBoards(boards);
        if (boards.length > 0 && !selectedBoard) {
          setSelectedBoard(boards[0]);
          setBoardName(boards[0].name);
          setBoardDescription(boards[0].description || '');
        }
      }
    } catch (error) {
      console.error('Error loading user boards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load board templates
  const loadBoardTemplates = async () => {
    try {
      const response = await fetch('/api/board-templates');
      if (response.ok) {
        const templates = await response.json();
        setBoardTemplates(templates);
      }
    } catch (error) {
      console.error('Error loading board templates:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserBoards();
      loadBoardTemplates();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (selectedBoard) {
      setBoardName(selectedBoard.name);
      setBoardDescription(selectedBoard.description || '');
    }
  }, [selectedBoard]);

  // Handle board creation from template
  const createBoardFromTemplate = async (templateId: string) => {
    try {
      setSaving(true);
      const template = boardTemplates.find(t => t.id === templateId);
      
      const response = await fetch('/api/user/kanban/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: `${template?.name} Board`,
          description: `Board based on ${template?.name} methodology`,
          templateId
        })
      });

      if (response.ok) {
        const newBoard = await response.json();
        setUserBoards([...userBoards, newBoard]);
        setSelectedBoard(newBoard);
        onBoardUpdated?.(newBoard);
      }
    } catch (error) {
      console.error('Error creating board from template:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle board update
  const updateBoard = async () => {
    if (!selectedBoard) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/user/kanban/boards/${selectedBoard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: boardName,
          description: boardDescription
        })
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setUserBoards(userBoards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
        setSelectedBoard(updatedBoard);
        onBoardUpdated?.(updatedBoard);
      }
    } catch (error) {
      console.error('Error updating board:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle column reordering
  const handleColumnDragEnd = async (result: DropResult) => {
    if (!selectedBoard || !result.destination) return;

    const columns = Array.from(selectedBoard.columns);
    const [reorderedColumn] = columns.splice(result.source.index, 1);
    columns.splice(result.destination.index, 0, reorderedColumn);

    // Update order numbers
    const updatedColumns = columns.map((col, index) => ({
      ...col,
      order: index
    }));

    // Optimistic update
    const updatedBoard = { ...selectedBoard, columns: updatedColumns };
    setSelectedBoard(updatedBoard);
    setUserBoards(userBoards.map(b => b.id === updatedBoard.id ? updatedBoard : b));

    try {
      await fetch('/api/user/kanban/columns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          columns: updatedColumns
        })
      });
    } catch (error) {
      console.error('Error reordering columns:', error);
      // Revert on error
      loadUserBoards();
    }
  };

  // Add new column
  const addColumn = async () => {
    if (!selectedBoard) return;

    try {
      const response = await fetch('/api/user/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoard.id,
          userId,
          name: 'New Column',
          color: '#64748b',
          icon: '📋'
        })
      });

      if (response.ok) {
        loadUserBoards();
      }
    } catch (error) {
      console.error('Error adding column:', error);
    }
  };

  // Update column
  const updateColumn = async (column: UserKanbanColumn) => {
    try {
      const response = await fetch(`/api/user/kanban/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...column
        })
      });

      if (response.ok) {
        loadUserBoards();
        setEditingColumn(null);
      }
    } catch (error) {
      console.error('Error updating column:', error);
    }
  };

  // Delete column
  const deleteColumn = async (columnId: string) => {
    if (!selectedBoard || selectedBoard.columns.length <= 1) return;

    try {
      const response = await fetch(`/api/user/kanban/columns/${columnId}?userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadUserBoards();
      }
    } catch (error) {
      console.error('Error deleting column:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Board Settings</h2>
              <p className="text-slate-600 dark:text-slate-400">Customize your Kanban boards and workflow</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'boards', label: 'Board Settings', icon: '📊' },
              { id: 'columns', label: 'Column Management', icon: '📋' },
              { id: 'templates', label: 'Templates', icon: '🎯' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Loading board settings...</p>
            </div>
          ) : (
            <>
              {/* Board Settings Tab */}
              {activeTab === 'boards' && (
                <div className="space-y-6">
                  {/* Board Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Select Board
                    </label>
                    <select
                      value={selectedBoard?.id || ''}
                      onChange={(e) => {
                        const board = userBoards.find(b => b.id === e.target.value);
                        setSelectedBoard(board || null);
                      }}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      {userBoards.map(board => (
                        <option key={board.id} value={board.id}>
                          {board.name} {board.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBoard && (
                    <>
                      {/* Board Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Board Name
                        </label>
                        <input
                          type="text"
                          value={boardName}
                          onChange={(e) => setBoardName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Board Description */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={boardDescription}
                          onChange={(e) => setBoardDescription(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Save Button */}
                      <button
                        onClick={updateBoard}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Column Management Tab */}
              {activeTab === 'columns' && selectedBoard && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Manage Columns
                    </h3>
                    <button
                      onClick={addColumn}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Column
                    </button>
                  </div>

                  <DragDropContext onDragEnd={handleColumnDragEnd}>
                    <Droppable droppableId="columns">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="space-y-3"
                        >
                          {selectedBoard.columns.map((column, index) => (
                            <Draggable key={column.id} draggableId={column.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 ${
                                    snapshot.isDragging ? 'shadow-lg scale-105' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div
                                        {...provided.dragHandleProps}
                                        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                        </svg>
                                      </div>
                                      <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: column.color }}
                                      />
                                      <span className="text-lg">{column.icon}</span>
                                      <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{column.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                          {column.maxWipLimit ? `WIP Limit: ${column.maxWipLimit}` : 'No WIP limit'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => setEditingColumn(column)}
                                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      {selectedBoard.columns.length > 1 && (
                                        <button
                                          onClick={() => deleteColumn(column.id)}
                                          className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Board Templates
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {boardTemplates.map(template => (
                      <div
                        key={template.id}
                        className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{template.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{template.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              {template.category} • {template.methodology}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.columns.slice(0, 4).map((col: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white"
                              style={{ backgroundColor: col.color }}
                            >
                              <span>{col.icon}</span>
                              <span>{col.name}</span>
                            </div>
                          ))}
                          {template.columns.length > 4 && (
                            <div className="px-2 py-1 rounded text-xs bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300">
                              +{template.columns.length - 4} more
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => createBoardFromTemplate(template.id)}
                          disabled={saving}
                          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors"
                        >
                          {saving ? 'Creating...' : 'Create Board'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Column Edit Modal */}
        {editingColumn && (
          <ColumnEditModal
            column={editingColumn}
            onSave={updateColumn}
            onCancel={() => setEditingColumn(null)}
          />
        )}
      </div>
    </div>
  );
}

// Column Edit Modal Component
function ColumnEditModal({ 
  column, 
  onSave, 
  onCancel 
}: { 
  column: UserKanbanColumn; 
  onSave: (column: UserKanbanColumn) => void; 
  onCancel: () => void; 
}) {
  const [editedColumn, setEditedColumn] = useState(column);

  const colorOptions = [
    '#64748b', '#3b82f6', '#10b981', '#f59e0b', 
    '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'
  ];

  const iconOptions = ['📋', '🚀', '⚡', '🎯', '🔨', '📊', '✅', '🚨', '⏸️', '🔄'];

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Edit Column
          </h3>
          
          <div className="space-y-4">
            {/* Column Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editedColumn.name}
                onChange={(e) => setEditedColumn({ ...editedColumn, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setEditedColumn({ ...editedColumn, color })}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      editedColumn.color === color ? 'border-slate-900 dark:border-white' : 'border-slate-300 dark:border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setEditedColumn({ ...editedColumn, icon })}
                    className={`w-10 h-10 text-lg rounded-lg border-2 ${
                      editedColumn.icon === icon ? 'border-blue-500' : 'border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* WIP Limit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                WIP Limit (optional)
              </label>
              <input
                type="number"
                min="0"
                value={editedColumn.maxWipLimit || ''}
                onChange={(e) => setEditedColumn({ 
                  ...editedColumn, 
                  maxWipLimit: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onSave(editedColumn)}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}