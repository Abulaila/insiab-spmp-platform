'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgramWithTeamMembers } from '../../lib/database';
import { ViewMode, SortConfig } from '../../app/programs/page';

interface ProgramViewEngineProps {
  programs: ProgramWithTeamMembers[];
  viewMode: ViewMode;
  selectedPrograms: string[];
  setSelectedPrograms: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loading: boolean;
  setViewMode: (mode: ViewMode) => void;
}

export default function ProgramViewEngine({
  programs,
  viewMode,
  selectedPrograms,
  setSelectedPrograms,
  sortConfig,
  setSortConfig,
  loading,
  setViewMode
}: ProgramViewEngineProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const handleProgramSelect = (programId: string) => {
    if (selectedPrograms.includes(programId)) {
      setSelectedPrograms(selectedPrograms.filter(id => id !== programId));
    } else {
      setSelectedPrograms([...selectedPrograms, programId]);
    }
  };

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {programs.map((program, index) => (
        <motion.div
          key={program.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border-2 transition-all duration-200 cursor-pointer ${
            selectedPrograms.includes(program.id)
              ? 'border-brand-500 ring-2 ring-brand-200/50 dark:ring-brand-800/50'
              : 'border-white/30 dark:border-gray-700/30 hover:border-brand-300/50 dark:hover:border-brand-600/30'
          }`}
          onClick={() => handleProgramSelect(program.id)}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {program.name}
              </h3>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                  {program.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {program.description}
            </p>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{program.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${program.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(program.priority)}`}>
                  {program.priority.toUpperCase()}
                </span>
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {program.methodology}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  {program.teamMembers.length}
                </span>
              </div>
            </div>

            {/* Budget */}
            <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Budget</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  ${program.budget?.toLocaleString() || '0'}
                </span>
              </div>
            </div>

            {/* Due Date */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Due Date</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(program.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Tags */}
            {program.tags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex flex-wrap gap-1">
                  {program.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {program.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded">
                      +{program.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Program
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Progress
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Budget
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Team
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Due Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {programs.map((program, index) => (
            <motion.tr
              key={program.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                selectedPrograms.includes(program.id) ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''
              }`}
              onClick={() => handleProgramSelect(program.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {program.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                    {program.description}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                  {program.status.replace('_', ' ').toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(program.priority)}`}>
                  {program.priority.toUpperCase()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                    <div 
                      className="bg-brand-600 h-2 rounded-full"
                      style={{ width: `${program.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 dark:text-white">{program.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${program.budget?.toLocaleString() || '0'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 dark:text-white mr-2">
                    {program.teamMembers.length}
                  </span>
                  <div className="flex -space-x-1 overflow-hidden">
                    {program.teamMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.user.id}
                        className="inline-block h-6 w-6 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-900"
                        title={member.user.name}
                      >
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {program.teamMembers.length > 3 && (
                      <div className="inline-block h-6 w-6 rounded-full bg-gray-400 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-900">
                        +{program.teamMembers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {new Date(program.dueDate).toLocaleDateString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPlaceholderView = (viewName: string) => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-12">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {viewName} View Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The {viewName.toLowerCase()} view is being developed and will be available in the next update.
        </p>
        <div className="flex justify-center space-x-3">
          <button
            onClick={() => setViewMode('cards')}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-xl hover:from-brand-700 hover:to-brand-600 transition-all shadow-sm"
          >
            Switch to Cards View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all shadow-sm"
          >
            Switch to List View
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Programs Found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            No programs match your current filters. Try adjusting your search criteria.
          </p>
        </div>
      </div>
    );
  }

  switch (viewMode) {
    case 'cards':
      return renderCardsView();
    case 'list':
      return renderListView();
    case 'kanban':
      return renderPlaceholderView('Kanban');
    case 'gantt':
      return renderPlaceholderView('Gantt');
    case 'calendar':
      return renderPlaceholderView('Calendar');
    case 'network':
      return renderPlaceholderView('Network');
    default:
      return renderCardsView();
  }
}