'use client';

import { motion } from 'framer-motion';

interface AnalyticsData {
  statusCounts: Record<string, number>;
  methodologyCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  averageProgress: number;
  totalBudget: number;
  overdueCount: number;
  progressDistribution: Record<string, number>;
  totalPortfolios: number;
  activePortfolios: number;
  totalProjects: number;
  averageProjectsPerPortfolio: number;
}

interface QuickChartsSectionProps {
  analyticsData: AnalyticsData;
}

export default function QuickChartsSection({ analyticsData }: QuickChartsSectionProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 border-green-200/30 dark:border-green-700/30',
      'completed': 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200/30 dark:border-blue-700/30',
      'on_hold': 'bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200/30 dark:border-yellow-700/30',
      'blocked': 'bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 border-red-200/30 dark:border-red-700/30'
    };
    return colors[status as keyof typeof colors] || 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200/30 dark:border-gray-700/30';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'high': 'bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 border-red-200/30 dark:border-red-700/30',
      'medium': 'bg-gradient-to-br from-yellow-50/80 to-yellow-100/80 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-200/30 dark:border-yellow-700/30',
      'low': 'bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 border-green-200/30 dark:border-green-700/30'
    };
    return colors[priority as keyof typeof colors] || 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200/30 dark:border-gray-700/30';
  };

  const getMethodologyColor = (methodology: string) => {
    const colors = {
      'agile': 'bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200/30 dark:border-purple-700/30',
      'waterfall': 'bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200/30 dark:border-blue-700/30',
      'hybrid': 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200/30 dark:border-emerald-700/30'
    };
    return colors[methodology as keyof typeof colors] || 'bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-900/30 dark:to-gray-800/30 border-gray-200/30 dark:border-gray-700/30';
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Analytics</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overview of all portfolio metrics and distributions</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Portfolio Overview</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total Portfolios */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 dark:from-indigo-900/30 dark:to-indigo-800/30 backdrop-blur-sm rounded-xl border border-indigo-200/30 dark:border-indigo-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Total Portfolios</p>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{analyticsData.totalPortfolios}</p>
            </div>
            <div className="p-2 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg">
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Active Portfolios */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/30 dark:to-green-800/30 backdrop-blur-sm rounded-xl border border-green-200/30 dark:border-green-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Active Portfolios</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.activePortfolios}</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Total Budget */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-800/30 backdrop-blur-sm rounded-xl border border-purple-200/30 dark:border-purple-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Budget</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(analyticsData.totalBudget)}</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Average Progress */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-900/30 dark:to-orange-800/30 backdrop-blur-sm rounded-xl border border-orange-200/30 dark:border-orange-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Average Progress</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analyticsData.averageProgress}%</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-800/50 rounded-lg">
              <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Total Projects */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-cyan-50/80 to-cyan-100/80 dark:from-cyan-900/30 dark:to-cyan-800/30 backdrop-blur-sm rounded-xl border border-cyan-200/30 dark:border-cyan-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Total Projects</p>
              <p className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">{analyticsData.totalProjects}</p>
            </div>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-800/50 rounded-lg">
              <svg className="w-6 h-6 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Average Projects per Portfolio */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-pink-50/80 to-pink-100/80 dark:from-pink-900/30 dark:to-pink-800/30 backdrop-blur-sm rounded-xl border border-pink-200/30 dark:border-pink-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Avg Projects/Portfolio</p>
              <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">{analyticsData.averageProjectsPerPortfolio}</p>
            </div>
            <div className="p-2 bg-pink-100 dark:bg-pink-800/50 rounded-lg">
              <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Overdue Count */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 backdrop-blur-sm rounded-xl border border-red-200/30 dark:border-red-700/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{analyticsData.overdueCount}</p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Distribution Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution */}
        <motion.div
          custom={7}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.statusCounts).map(([status, count]) => (
              <div key={status} className={`p-3 rounded-lg ${getStatusColor(status)} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {status.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          custom={8}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.priorityCounts).map(([priority, count]) => (
              <div key={priority} className={`p-3 rounded-lg ${getPriorityColor(priority)} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{priority}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Methodology Distribution */}
        <motion.div
          custom={9}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30 p-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Methodology Distribution</h3>
          <div className="space-y-3">
            {Object.entries(analyticsData.methodologyCounts).map(([methodology, count]) => (
              <div key={methodology} className={`p-3 rounded-lg ${getMethodologyColor(methodology)} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{methodology}</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}