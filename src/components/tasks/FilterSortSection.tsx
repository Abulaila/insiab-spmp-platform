'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskFilters, SortConfig, ViewMode, TaskWithDetails } from '../../app/tasks/page';

interface FilterSortSectionProps {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  tasks: TaskWithDetails[];
  filteredCount: number;
}

export default function FilterSortSection({
  filters,
  setFilters,
  sortConfig,
  setSortConfig,
  viewMode,
  setViewMode,
  showFilters,
  setShowFilters,
  selectedTasks,
  setSelectedTasks,
  tasks,
  filteredCount
}: FilterSortSectionProps) {

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleSortChange = (field: string) => {
    const direction = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ field, direction });
  };

  const viewModeOptions = [
    { key: 'cards', label: 'Cards', icon: '⊞' },
    { key: 'list', label: 'List', icon: '☰' },
    { key: 'kanban', label: 'Kanban', icon: '⫲' },
    { key: 'gantt', label: 'Gantt', icon: '📊' },
    { key: 'calendar', label: 'Calendar', icon: '📅' },
    { key: 'timeline', label: 'Timeline', icon: '⏱️' }
  ];

  // Get unique values for filter dropdowns
  const uniqueAssignees = Array.from(new Set(tasks.filter(t => t.assignee).map(t => t.assignee!)))
    .reduce((acc, assignee) => {
      if (!acc.find(a => a.id === assignee.id)) {
        acc.push(assignee);
      }
      return acc;
    }, [] as typeof tasks[0]['assignee'][]);

  const uniqueProjects = Array.from(new Set(tasks.filter(t => t.project).map(t => t.project!)))
    .reduce((acc, project) => {
      if (!acc.find(p => p.id === project.id)) {
        acc.push(project);
      }
      return acc;
    }, [] as typeof tasks[0]['project'][]);

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
      
      {/* Main Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        
        {/* Search and Results Count */}
        <div className="flex-1 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 dark:bg-gray-800/50 dark:text-white backdrop-blur-sm transition-all"
            />
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            {filteredCount} of {tasks.length} tasks
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
          <div className="flex rounded-xl border border-gray-200/50 dark:border-gray-600/50 overflow-hidden backdrop-blur-sm">
            {viewModeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setViewMode(option.key as ViewMode)}
                className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  viewMode === option.key
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-50/70 dark:hover:bg-gray-700/50'
                } border-r border-gray-200/30 dark:border-gray-600/30 last:border-r-0`}
                title={option.label}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${sortConfig.field}_${sortConfig.direction}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('_');
                setSortConfig({ field, direction: direction as 'asc' | 'desc' });
              }}
              className="appearance-none bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-600/50 rounded-xl px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 backdrop-blur-sm transition-all"
            >
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
              <option value="status_asc">Status A-Z</option>
              <option value="status_desc">Status Z-A</option>
              <option value="priority_desc">Priority High-Low</option>
              <option value="priority_asc">Priority Low-High</option>
              <option value="progress_desc">Progress High-Low</option>
              <option value="progress_asc">Progress Low-High</option>
              <option value="dueDate_asc">Due Date Near-Far</option>
              <option value="dueDate_desc">Due Date Far-Near</option>
              <option value="estimatedHours_desc">Est. Hours High-Low</option>
              <option value="estimatedHours_asc">Est. Hours Low-High</option>
              <option value="actualHours_desc">Actual Hours High-Low</option>
              <option value="actualHours_asc">Actual Hours Low-High</option>
              <option value="assignee_asc">Assignee A-Z</option>
              <option value="assignee_desc">Assignee Z-A</option>
              <option value="project_asc">Project A-Z</option>
              <option value="project_desc">Project Z-A</option>
              <option value="createdAt_desc">Created Recent-Old</option>
              <option value="createdAt_asc">Created Old-Recent</option>
              <option value="lastUpdated_desc">Updated Recent-Old</option>
              <option value="lastUpdated_asc">Updated Old-Recent</option>
            </select>
            <svg className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              showFilters
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm'
                : 'bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-gray-700/50 backdrop-blur-sm'
            }`}
          >
            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 pt-6 border-t border-gray-200/30 dark:border-gray-700/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {['not_started', 'in_progress', 'blocked', 'completed', 'cancelled'].map((status) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, status: [...filters.status, status] });
                          } else {
                            setFilters({ ...filters, status: filters.status.filter(s => s !== status) });
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {['urgent', 'high', 'medium', 'low'].map((priority) => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, priority: [...filters.priority, priority] });
                          } else {
                            setFilters({ ...filters, priority: filters.priority.filter(p => p !== priority) });
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assignee
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.assignee.includes('unassigned')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, assignee: [...filters.assignee, 'unassigned'] });
                        } else {
                          setFilters({ ...filters, assignee: filters.assignee.filter(a => a !== 'unassigned') });
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Unassigned
                    </span>
                  </label>
                  {uniqueAssignees.map((assignee) => (
                    <label key={assignee.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.assignee.includes(assignee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, assignee: [...filters.assignee, assignee.id] });
                          } else {
                            setFilters({ ...filters, assignee: filters.assignee.filter(a => a !== assignee.id) });
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {assignee.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.project.includes('no_project')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, project: [...filters.project, 'no_project'] });
                        } else {
                          setFilters({ ...filters, project: filters.project.filter(p => p !== 'no_project') });
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      No Project
                    </span>
                  </label>
                  {uniqueProjects.map((project) => (
                    <label key={project.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.project.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, project: [...filters.project, project.id] });
                          } else {
                            setFilters({ ...filters, project: filters.project.filter(p => p !== project.id) });
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {project.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              
              {/* Progress Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress Range: {filters.progressRange.min}% - {filters.progressRange.max}%
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.progressRange.min}
                    onChange={(e) => setFilters({
                      ...filters,
                      progressRange: { ...filters.progressRange, min: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.progressRange.max}
                    onChange={(e) => setFilters({
                      ...filters,
                      progressRange: { ...filters.progressRange, max: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Filters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasSubtasks === true}
                      onChange={(e) => {
                        setFilters({ 
                          ...filters, 
                          hasSubtasks: e.target.checked ? true : null 
                        });
                      }}
                      className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Has Subtasks
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isOverdue === true}
                      onChange={(e) => {
                        setFilters({ 
                          ...filters, 
                          isOverdue: e.target.checked ? true : null 
                        });
                      }}
                      className="mr-2 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Overdue
                    </span>
                  </label>
                </div>
              </div>

              {/* Estimated Hours Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Est. Hours: {filters.estimatedHoursRange.min}h - {filters.estimatedHoursRange.max}h
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.estimatedHoursRange.min}
                    onChange={(e) => setFilters({
                      ...filters,
                      estimatedHoursRange: { ...filters.estimatedHoursRange, min: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.estimatedHoursRange.max}
                    onChange={(e) => setFilters({
                      ...filters,
                      estimatedHoursRange: { ...filters.estimatedHoursRange, max: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setFilters({
                  search: '',
                  status: [],
                  priority: [],
                  assignee: [],
                  project: [],
                  dateRange: { start: null, end: null },
                  progressRange: { min: 0, max: 100 },
                  estimatedHoursRange: { min: 0, max: 100 },
                  tags: [],
                  hasSubtasks: null,
                  isOverdue: null
                })}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-xl transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 text-sm bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:from-brand-700 hover:to-brand-600 transition-all shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      {(filters.search || filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0 || filters.project.length > 0) && (
        <div className="mt-4 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-800 dark:text-brand-300 text-xs rounded-full">
                Search: "{filters.search}"
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="ml-1 text-brand-600 hover:text-brand-800"
                >
                  ×
                </button>
              </span>
            )}

            {filters.status.map((status) => (
              <span key={status} className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 text-xs rounded-full">
                Status: {status.replace('_', ' ')}
                <button
                  onClick={() => setFilters({ ...filters, status: filters.status.filter(s => s !== status) })}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}

            {filters.priority.map((priority) => (
              <span key={priority} className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded-full">
                Priority: {priority}
                <button
                  onClick={() => setFilters({ ...filters, priority: filters.priority.filter(p => p !== priority) })}
                  className="ml-1 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}

            {filters.assignee.map((assigneeId) => {
              const assigneeName = assigneeId === 'unassigned' ? 'Unassigned' : 
                uniqueAssignees.find(a => a.id === assigneeId)?.name || assigneeId;
              return (
                <span key={assigneeId} className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Assignee: {assigneeName}
                  <button
                    onClick={() => setFilters({ ...filters, assignee: filters.assignee.filter(a => a !== assigneeId) })}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}

            {filters.project.map((projectId) => {
              const projectName = projectId === 'no_project' ? 'No Project' : 
                uniqueProjects.find(p => p.id === projectId)?.name || projectId;
              return (
                <span key={projectId} className="inline-flex items-center px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 text-xs rounded-full">
                  Project: {projectName}
                  <button
                    onClick={() => setFilters({ ...filters, project: filters.project.filter(p => p !== projectId) })}
                    className="ml-1 text-orange-600 hover:text-orange-800"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}