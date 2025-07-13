'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../components/layout/AppLayout';
import { mockProjects, getProjectStats } from '../../data/projects';

export default function AnalyticsPage() {
  const [isClientSide, setIsClientSide] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    blocked: 0,
    onHold: 0,
    agileProjects: 0,
    waterfallProjects: 0,
    hybridProjects: 0,
    totalBudget: 0,
    avgProgress: 0
  });
  
  useEffect(() => {
    setIsClientSide(true);
    setStats(getProjectStats());
  }, []);
  
  // Sample analytics data
  const analyticsData = {
    totalProjects: stats.total,
    activeProjects: stats.active,
    completedProjects: stats.completed,
    totalBudget: stats.totalBudget,
    avgProgress: stats.avgProgress,
    teamUtilization: 78,
    onTimeDelivery: 92,
    budgetEfficiency: 87,
    clientSatisfaction: 4.7,
    monthlyMetrics: [
      { month: 'Jan', projects: 12, budget: 450000, completion: 89 },
      { month: 'Feb', projects: 15, budget: 520000, completion: 91 },
      { month: 'Mar', projects: 18, budget: 680000, completion: 85 },
      { month: 'Apr', projects: 22, budget: 750000, completion: 88 },
      { month: 'May', projects: 20, budget: 690000, completion: 94 },
      { month: 'Jun', projects: 25, budget: 820000, completion: 92 }
    ]
  };

  if (!isClientSide) {
    return (
      <AppLayout title="📊 Analytics Dashboard" subtitle="Reports & Insights">
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="📊 Analytics Dashboard" subtitle="Reports & Insights">
      <div className="p-6 space-y-8">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
            <p className="text-gray-600">Comprehensive insights into project performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              📊 Export Report
            </button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Total Projects</div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📁</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.totalProjects}</div>
            <div className="text-sm text-green-600">↗ +12% from last month</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Team Utilization</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">👥</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.teamUtilization}%</div>
            <div className="text-sm text-green-600">↗ +5% from last month</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">On-Time Delivery</div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">⏰</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.onTimeDelivery}%</div>
            <div className="text-sm text-green-600">↗ +3% from last month</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Budget Efficiency</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">💰</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{analyticsData.budgetEfficiency}%</div>
            <div className="text-sm text-orange-600">↗ +2% from last month</div>
          </div>
        </div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Progress Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Project Progress Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Completed Projects</span>
                <span className="text-sm font-medium">{stats.completed}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Projects</span>
                <span className="text-sm font-medium">{stats.active}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${(stats.active / stats.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blocked/On Hold</span>
                <span className="text-sm font-medium">{stats.blocked + stats.onHold}/{stats.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full"
                  style={{ width: `${((stats.blocked + stats.onHold) / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Methodology Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Methodology Distribution</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.agileProjects}</div>
                <div className="text-sm text-gray-600">Agile Projects</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.agileProjects / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{stats.waterfallProjects}</div>
                <div className="text-sm text-gray-600">Waterfall Projects</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.waterfallProjects / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.hybridProjects}</div>
                <div className="text-sm text-gray-600">Hybrid Projects</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(stats.hybridProjects / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Trends</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Projects</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Budget</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Completion Rate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Trend</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyMetrics.map((metric, index) => (
                  <tr key={metric.month} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{metric.month}</td>
                    <td className="py-3 px-4">{metric.projects}</td>
                    <td className="py-3 px-4">${(metric.budget / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span>{metric.completion}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${metric.completion}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-green-600">↗ +{index + 2}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Analytics Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white bg-opacity-20 text-white p-4 rounded-lg hover:bg-opacity-30 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Generate Custom Report</div>
              <div className="text-sm opacity-90">Create detailed analytics reports</div>
            </button>
            
            <button className="bg-white bg-opacity-20 text-white p-4 rounded-lg hover:bg-opacity-30 transition-colors">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-medium">Performance Trends</div>
              <div className="text-sm opacity-90">Analyze project performance over time</div>
            </button>
            
            <button className="bg-white bg-opacity-20 text-white p-4 rounded-lg hover:bg-opacity-30 transition-colors">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-medium">Goal Tracking</div>
              <div className="text-sm opacity-90">Monitor KPIs and objectives</div>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}