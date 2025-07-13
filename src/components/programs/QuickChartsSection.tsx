'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  statusCounts: Record<string, number>;
  methodologyCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  averageProgress: number;
  totalBudget: number;
  overdueCount: number;
  progressDistribution: Record<string, number>;
  totalPrograms: number;
  activePrograms: number;
}

interface QuickChartsSectionProps {
  analyticsData: AnalyticsData;
}

export default function QuickChartsSection({ analyticsData }: QuickChartsSectionProps) {
  const {
    statusCounts,
    methodologyCounts,
    priorityCounts,
    averageProgress,
    totalBudget,
    overdueCount,
    progressDistribution,
    totalPrograms,
    activePrograms
  } = analyticsData;

  // Status chart data
  const statusData = useMemo(() => {
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: getStatusColor(status)
    }));
  }, [statusCounts]);

  // Priority chart data
  const priorityData = useMemo(() => {
    return Object.entries(priorityCounts).map(([priority, count]) => ({
      name: priority.toUpperCase(),
      value: count,
      color: getPriorityColor(priority)
    }));
  }, [priorityCounts]);

  function getStatusColor(status: string) {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'on_hold': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  }

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Program Analytics Dashboard
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Updated just now
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        
        {/* Total Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalPrograms}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Total Programs</p>
          </div>
        </motion.div>

        {/* Active Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-green-600 to-green-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-green-900 dark:text-green-100">{activePrograms}</p>
            <p className="text-sm text-green-700 dark:text-green-300">Active Programs</p>
          </div>
        </motion.div>

        {/* Average Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{averageProgress}%</p>
            <p className="text-sm text-purple-700 dark:text-purple-300">Avg Progress</p>
          </div>
        </motion.div>

        {/* Total Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              ${(totalBudget / 1000000).toFixed(1)}M
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Total Budget</p>
          </div>
        </motion.div>

        {/* Overdue Programs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-200/50 dark:border-red-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-red-900 dark:text-red-100">{overdueCount}</p>
            <p className="text-sm text-red-700 dark:text-red-300">Overdue</p>
          </div>
        </motion.div>

        {/* Methodologies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-900/30 dark:to-amber-800/30 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50 backdrop-blur-sm"
        >
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-br from-amber-600 to-amber-500 rounded-xl shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {Object.keys(methodologyCounts).length}
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">Methodologies</p>
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.value / totalPrograms) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {priorityData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((item.value / totalPrograms) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Progress Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 border border-gray-200/30 dark:border-gray-700/30"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Distribution</h3>
          <div className="space-y-3">
            {Object.entries(progressDistribution).map(([status, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'Not Started' ? 'bg-gray-400' :
                    status === 'In Progress' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round((count / totalPrograms) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}