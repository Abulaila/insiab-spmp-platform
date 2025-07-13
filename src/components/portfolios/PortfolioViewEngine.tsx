'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SortConfig, ViewMode } from '../../app/portfolios/page';
import { PortfolioWithDetails } from '../../lib/database';

interface PortfolioViewEngineProps {
  portfolios: PortfolioWithDetails[];
  viewMode: ViewMode;
  selectedPortfolios: string[];
  setSelectedPortfolios: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loading: boolean;
  setViewMode: (mode: ViewMode) => void;
}

export default function PortfolioViewEngine({
  portfolios,
  viewMode,
  selectedPortfolios,
  setSelectedPortfolios,
  sortConfig,
  setSortConfig,
  loading,
  setViewMode
}: PortfolioViewEngineProps) {
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'on_hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'blocked': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handlePortfolioSelect = (portfolioId: string) => {
    if (selectedPortfolios.includes(portfolioId)) {
      setSelectedPortfolios(selectedPortfolios.filter(id => id !== portfolioId));
    } else {
      setSelectedPortfolios([...selectedPortfolios, portfolioId]);
    }
  };

  // Cards View
  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {portfolios.map((portfolio, index) => (
          <motion.div
            key={portfolio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${
              selectedPortfolios.includes(portfolio.id) ? 'ring-2 ring-brand-500' : ''
            }`}
            onClick={() => handlePortfolioSelect(portfolio.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {portfolio.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {portfolio.description}
                </p>
              </div>
              <input
                type="checkbox"
                checked={selectedPortfolios.includes(portfolio.id)}
                onChange={() => handlePortfolioSelect(portfolio.id)}
                className="ml-3 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Status and Priority */}
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(portfolio.status)}`}>
                {portfolio.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(portfolio.priority)}`}>
                {portfolio.priority.toUpperCase()}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                {portfolio.methodology.toUpperCase()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-white">{portfolio.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(portfolio.progress)}`}
                  style={{ width: `${portfolio.progress}%` }}
                />
              </div>
            </div>

            {/* Budget and Projects */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(portfolio.budget)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Projects</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{portfolio.projects.length}</p>
              </div>
            </div>

            {/* Team and Due Date */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-gray-600 dark:text-gray-400">{portfolio.teamMembers.length} members</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">Due {formatDate(portfolio.dueDate)}</span>
            </div>

            {/* Tags */}
            {portfolio.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {portfolio.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                  >
                    {tag.tag}
                  </span>
                ))}
                {portfolio.tags.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                    +{portfolio.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  // List View
  const renderListView = () => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedPortfolios.length === portfolios.length && portfolios.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPortfolios(portfolios.map(p => p.id));
                    } else {
                      setSelectedPortfolios([]);
                    }
                  }}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Name
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
                Projects
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Team
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/30 dark:divide-gray-700/30">
            <AnimatePresence>
              {portfolios.map((portfolio, index) => (
                <motion.tr
                  key={portfolio.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                    selectedPortfolios.includes(portfolio.id) ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''
                  }`}
                  onClick={() => handlePortfolioSelect(portfolio.id)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedPortfolios.includes(portfolio.id)}
                      onChange={() => handlePortfolioSelect(portfolio.id)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{portfolio.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{portfolio.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(portfolio.status)}`}>
                      {portfolio.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(portfolio.priority)}`}>
                      {portfolio.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(portfolio.progress)}`}
                          style={{ width: `${portfolio.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{portfolio.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {portfolio.projects.length}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(portfolio.budget)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDate(portfolio.dueDate)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-1">
                      {portfolio.teamMembers.slice(0, 3).map((member) => (
                        <div
                          key={member.id}
                          className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300 border-2 border-white dark:border-gray-900"
                          title={member.user.name}
                        >
                          {member.user.name.charAt(0)}
                        </div>
                      ))}
                      {portfolio.teamMembers.length > 3 && (
                        <div className="w-6 h-6 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white dark:border-gray-900">
                          +{portfolio.teamMembers.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );

  // Coming Soon View for other modes
  const renderComingSoonView = (mode: string) => (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-12 text-center">
      <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {mode.charAt(0).toUpperCase() + mode.slice(1)} View Coming Soon
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        We're working on bringing you the {mode} view for portfolios. Stay tuned!
      </p>
      <button
        onClick={() => setViewMode('cards')}
        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors"
      >
        Switch to Cards View
      </button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-12 text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading portfolios...</p>
      </div>
    );
  }

  // Empty state
  if (portfolios.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 dark:border-gray-700/30 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No portfolios found</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          No portfolios match your current filters. Try adjusting your search criteria or create a new portfolio.
        </p>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors">
          Create Portfolio
        </button>
      </div>
    );
  }

  // Render the appropriate view
  return (
    <div className="space-y-6">
      {viewMode === 'cards' && renderCardsView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'kanban' && renderComingSoonView('kanban')}
      {viewMode === 'gantt' && renderComingSoonView('gantt')}
      {viewMode === 'calendar' && renderComingSoonView('calendar')}
      {viewMode === 'network' && renderComingSoonView('network')}
    </div>
  );
}