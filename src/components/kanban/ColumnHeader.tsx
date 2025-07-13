'use client';

import { useState } from 'react';
import type { KanbanColumnType } from './KanbanBoard';

interface ColumnHeaderProps {
  column: KanbanColumnType;
  onColumnUpdate: (column: KanbanColumnType) => void;
  dragHandleProps?: any;
  isEditingName: boolean;
  setIsEditingName: (editing: boolean) => void;
}

export function ColumnHeader({ 
  column, 
  onColumnUpdate, 
  dragHandleProps,
  isEditingName,
  setIsEditingName 
}: ColumnHeaderProps) {
  const [newName, setNewName] = useState(column.name);
  const [showMenu, setShowMenu] = useState(false);
  const [newWipLimit, setNewWipLimit] = useState(column.maxWipLimit?.toString() || '');

  const handleNameUpdate = async () => {
    if (newName.trim() === column.name) {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/kanban/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to update column name');
      }

      const updatedColumn = await response.json();
      onColumnUpdate(updatedColumn);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating column name:', error);
      setNewName(column.name);
      setIsEditingName(false);
    }
  };

  const handleWipLimitUpdate = async () => {
    const wipLimit = newWipLimit ? parseInt(newWipLimit) : null;
    
    try {
      const response = await fetch(`/api/kanban/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxWipLimit: wipLimit })
      });

      if (!response.ok) {
        throw new Error('Failed to update WIP limit');
      }

      const updatedColumn = await response.json();
      onColumnUpdate(updatedColumn);
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating WIP limit:', error);
    }
  };

  const handleColorUpdate = async (color: string) => {
    try {
      const response = await fetch(`/api/kanban/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color })
      });

      if (!response.ok) {
        throw new Error('Failed to update column color');
      }

      const updatedColumn = await response.json();
      onColumnUpdate(updatedColumn);
    } catch (error) {
      console.error('Error updating column color:', error);
    }
  };

  const handleToggleCollapse = async () => {
    try {
      const response = await fetch(`/api/kanban/columns/${column.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCollapsed: !column.isCollapsed })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle column collapse');
      }

      const updatedColumn = await response.json();
      onColumnUpdate(updatedColumn);
    } catch (error) {
      console.error('Error toggling column collapse:', error);
    }
  };

  const isOverWipLimit = column.maxWipLimit && column.cards.length > column.maxWipLimit;
  const presetColors = ['#64748b', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];

  return (
    <div 
      className="flex items-center justify-between p-4 border-b border-slate-200/60 dark:border-slate-700/60"
      style={{ borderTopColor: column.color || '#64748b', borderTopWidth: '4px' }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>

        <div className="flex-1">
          {isEditingName ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameUpdate();
                if (e.key === 'Escape') {
                  setNewName(column.name);
                  setIsEditingName(false);
                }
              }}
              className="w-full text-sm font-bold bg-transparent border-none outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 rounded px-2 py-1 -mx-2 -my-1"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left w-full"
            >
              {column.name}
            </button>
          )}
        </div>

        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-colors ${
          isOverWipLimit 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          <span>{column.cards.length}</span>
          {column.maxWipLimit && (
            <>
              <span>/</span>
              <span>{column.maxWipLimit}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleCollapse}
          className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
          title={column.isCollapsed ? 'Expand column' : 'Collapse column'}
        >
          <svg className={`w-4 h-4 transition-transform ${column.isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
            title="Column options"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg py-2 z-20 min-w-[220px]">
              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-600">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Column Color</div>
                <div className="flex gap-1 flex-wrap">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorUpdate(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        column.color === color 
                          ? 'border-slate-400 dark:border-slate-500 scale-110' 
                          : 'border-slate-200 dark:border-slate-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-600">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">WIP Limit</div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={newWipLimit}
                    onChange={(e) => setNewWipLimit(e.target.value)}
                    placeholder="No limit"
                    className="flex-1 px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    min="1"
                  />
                  <button
                    onClick={handleWipLimitUpdate}
                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsEditingName(true)}
                className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
              >
                Rename Column
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}