'use client';

import { motion } from 'framer-motion';

interface AnalyticsData {
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  assigneeCounts: Record<string, number>;
  projectCounts: Record<string, number>;
  averageProgress: number;
  totalEstimatedHours: number;
  totalActualHours: number;
  overdueCount: number;
  completedCount: number;
  progressDistribution: Record<string, number>;
  totalTasks: number;
  activeTasks: number;
  completionRate: number;
  averageCompletionTime: number;
}

interface QuickChartsSectionProps {
  analyticsData: AnalyticsData;
}

export default function QuickChartsSection({ analyticsData }: QuickChartsSectionProps) {
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`;
  };

  const formatDays = (days: number) => {
    return `${days}d`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      blocked: 'bg-red-500',
      completed: 'bg-green-500',
      cancelled: 'bg-gray-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      not_started: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      in_progress: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      blocked: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      ),
      completed: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      cancelled: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
    return icons[status as keyof typeof icons] || null;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-700 bg-red-100 border-red-300',
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const totalStatusCount = Object.values(analyticsData.statusCounts).reduce((sum, count) => sum + count, 0);
  const efficiencyRate = analyticsData.totalEstimatedHours > 0 
    ? ((analyticsData.totalEstimatedHours / Math.max(analyticsData.totalActualHours, 1)) * 100)
    : 100;

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Real-time task metrics and insights</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-sm font-medium"
        >
          Export Report
        </motion.button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Tasks</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.totalTasks}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Tasks</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.activeTasks}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analyticsData.completionRate}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Avg Completion</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">{formatDays(analyticsData.averageCompletionTime)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Est. Hours</p>
              <p className="text-xl font-bold text-teal-900 dark:text-teal-100">{formatHours(analyticsData.totalEstimatedHours)}</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-4 rounded-lg border border-pink-200 dark:border-pink-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Actual Hours</p>
              <p className="text-xl font-bold text-pink-900 dark:text-pink-100">{formatHours(analyticsData.totalActualHours)}</p>
            </div>
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Efficiency</p>
              <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{Math.round(efficiencyRate)}%</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className={`p-4 rounded-lg border ${analyticsData.overdueCount > 0 
            ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800' 
            : 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${analyticsData.overdueCount > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'
              }`}>
                Overdue
              </p>
              <p className={`text-xl font-bold ${analyticsData.overdueCount > 0 
                ? 'text-red-900 dark:text-red-100' 
                : 'text-gray-900 dark:text-gray-100'
              }`}>
                {analyticsData.overdueCount}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${analyticsData.overdueCount > 0 
              ? 'bg-red-100 dark:bg-red-800/50' 
              : 'bg-gray-100 dark:bg-gray-800/50'
            }`}>
              <svg className={`w-5 h-5 ${analyticsData.overdueCount > 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Task Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.statusCounts).map(([status, count]) => {
              const percentage = totalStatusCount > 0 ? (count / totalStatusCount) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{count}</span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getStatusColor(status)} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.priorityCounts).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(priority)} capitalize`}>
                  {priority}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alerts & Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alerts & Insights</h3>
          <div className="space-y-3">
            
            {/* Overdue Tasks Alert */}
            {analyticsData.overdueCount > 0 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {analyticsData.overdueCount} Overdue Task{analyticsData.overdueCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">Require immediate attention</p>
                </div>
              </div>
            )}

            {/* High Priority Tasks */}
            {(analyticsData.priorityCounts.urgent > 0 || analyticsData.priorityCounts.high > 0) && (
              <div className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    {(analyticsData.priorityCounts.urgent || 0) + (analyticsData.priorityCounts.high || 0)} High Priority Task{((analyticsData.priorityCounts.urgent || 0) + (analyticsData.priorityCounts.high || 0)) !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Focus resources here</p>
                </div>
              </div>
            )}

            {/* Efficiency Insight */}
            <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Task Efficiency: {efficiencyRate >= 90 ? 'Excellent' : efficiencyRate >= 70 ? 'Good' : 'Needs Improvement'}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {efficiencyRate >= 90 ? 'Tasks completed within estimates' : 'Consider adjusting time estimates'}
                </p>
              </div>
            </div>

            {/* Completion Rate Insight */}
            <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Completion Rate: {analyticsData.completionRate}%
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {analyticsData.completionRate >= 80 ? 'Excellent productivity' : 'Consider reviewing workflow'}
                </p>
              </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}