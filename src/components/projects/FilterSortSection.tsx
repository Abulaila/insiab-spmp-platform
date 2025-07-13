'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProjectFilters, SortConfig, ViewMode } from '../../app/projects/page';
import { ProjectWithTeamMembers } from '../../lib/database';

interface FilterSortSectionProps {
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  projects: ProjectWithTeamMembers[];
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
  selectedProjects,
  setSelectedProjects,
  projects,
  filteredCount
}: FilterSortSectionProps) {

  const viewModeIcons = {
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    cards: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    gantt: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    kanban: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    calendar: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    network: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    )
  };

  const sortOptions = [
    { field: 'name', label: 'Name' },
    { field: 'status', label: 'Status' },
    { field: 'priority', label: 'Priority' },
    { field: 'progress', label: 'Progress' },
    { field: 'dueDate', label: 'Due Date' },
    { field: 'startDate', label: 'Start Date' },
    { field: 'budget', label: 'Budget' },
    { field: 'teamSize', label: 'Team Size' }
  ];

  const statusOptions = ['active', 'completed', 'on_hold', 'blocked'];
  const methodologyOptions = ['agile', 'waterfall', 'hybrid'];
  const priorityOptions = ['high', 'medium', 'low'];

  // Get unique tags from all projects
  const allTags = Array.from(new Set(projects.flatMap(p => p.tags.map(t => t.tag)))).sort();

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      status: [],
      methodology: [],
      priority: [],
      dateRange: { start: null, end: null },
      progressRange: { min: 0, max: 100 },
      budgetRange: { min: 0, max: 1000000 },
      tags: []
    });
  };

  const hasActiveFilters = filters.search || 
    filters.status.length > 0 || 
    filters.methodology.length > 0 || 
    filters.priority.length > 0 ||
    filters.tags.length > 0 ||
    filters.progressRange.min > 0 || 
    filters.progressRange.max < 100 ||
    filters.budgetRange.min > 0 || 
    filters.budgetRange.max < 1000000 ||
    filters.dateRange.start || 
    filters.dateRange.end;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      
      {/* Top Bar - Search, View Mode, Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
        
        {/* Search */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects, descriptions, tags, team members..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* View Mode Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 space-x-1">
          {(Object.keys(viewModeIcons) as ViewMode[]).map((mode) => (
            <motion.button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
            >
              {viewModeIcons[mode]}
            </motion.button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
              )}
            </div>
          </motion.button>

          <motion.button
            onClick={() => {/* Export functionality */}}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Export</span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredCount}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{projects.length}</span> projects
          </p>
          {selectedProjects.length > 0 && (
            <p className="text-sm text-brand-600 dark:text-brand-400">
              {selectedProjects.length} selected
            </p>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortConfig.field}
            onChange={(e) => setSortConfig({ ...sortConfig, field: e.target.value })}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {sortOptions.map(option => (
              <option key={option.field} value={option.field}>{option.label}</option>
            ))}
          </select>
          <motion.button
            onClick={() => setSortConfig({ 
              ...sortConfig, 
              direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' 
            })}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg 
              className={`w-4 h-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
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
            className="border-t border-gray-200 dark:border-gray-700 pt-4 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <div className="space-y-2">
                  {statusOptions.map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('status', [...filters.status, status]);
                          } else {
                            handleFilterChange('status', filters.status.filter(s => s !== status));
                          }
                        }}
                        className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Methodology Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Methodology</label>
                <div className="space-y-2">
                  {methodologyOptions.map(methodology => (
                    <label key={methodology} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.methodology.includes(methodology)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('methodology', [...filters.methodology, methodology]);
                          } else {
                            handleFilterChange('methodology', filters.methodology.filter(m => m !== methodology));
                          }
                        }}
                        className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {methodology}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <div className="space-y-2">
                  {priorityOptions.map(priority => (
                    <label key={priority} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange('priority', [...filters.priority, priority]);
                          } else {
                            handleFilterChange('priority', filters.priority.filter(p => p !== priority));
                          }
                        }}
                        className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500"
                      />
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {priority}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Progress Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress: {filters.progressRange.min}% - {filters.progressRange.max}%
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.progressRange.min}
                    onChange={(e) => handleFilterChange('progressRange', { 
                      ...filters.progressRange, 
                      min: parseInt(e.target.value) 
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.progressRange.max}
                    onChange={(e) => handleFilterChange('progressRange', { 
                      ...filters.progressRange, 
                      max: parseInt(e.target.value) 
                    })}
                    className="w-full"
                  />
                </div>
              </div>

            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  onClick={clearAllFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Clear All Filters
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}