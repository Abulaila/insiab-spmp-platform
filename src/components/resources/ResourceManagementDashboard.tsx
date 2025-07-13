'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { ResourceManagementEngine, Resource, ResourceGap, ResourceOptimization } from '../../lib/resource-management/resource-engine';
import WorkloadOptimizer from './WorkloadOptimizer';

interface ResourceManagementDashboardProps {
  resources: Resource[];
  projects: any[];
  tasks: any[];
  className?: string;
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  indigo: '#6366F1',
  pink: '#EC4899',
  teal: '#14B8A6',
  gray: '#6B7280'
};

// Mock data for demonstration
const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    skills: [
      { id: '1', name: 'React', category: 'Frontend', level: 9, certifications: [], experience: 5, lastUsed: '2024-01-01', verified: true },
      { id: '2', name: 'Node.js', category: 'Backend', level: 8, certifications: [], experience: 4, lastUsed: '2024-01-01', verified: true }
    ],
    availability: {
      hoursPerWeek: 40,
      timeZone: 'EST',
      workingHours: { start: '09:00', end: '17:00', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      vacations: [],
      holidays: []
    },
    capacity: {
      current: 95,
      optimal: 85,
      maximum: 100,
      burnoutRisk: 75,
      utilization: []
    },
    workload: [],
    performanceMetrics: {
      productivity: 92,
      quality: 88,
      velocity: 45,
      satisfaction: 8.5,
      collaboration: 90,
      trends: []
    },
    cost: {
      hourlyRate: 125,
      currency: 'USD',
      totalCost: 260000,
      budgetAllocated: 280000,
      budgetRemaining: 20000
    },
    status: 'active',
    location: {
      office: 'New York',
      remote: false,
      timeZone: 'EST',
      country: 'USA',
      city: 'New York'
    },
    preferences: {
      preferredProjects: [],
      avoidedProjects: [],
      preferredSkills: ['React', 'Node.js'],
      careerGoals: ['Tech Lead'],
      workStyle: 'collaborative'
    }
  },
  // Add more mock resources...
];

export default function ResourceManagementDashboard({
  resources: propResources = [],
  projects = [],
  tasks = [],
  className = ''
}: ResourceManagementDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'allocation' | 'skills' | 'optimization' | 'workload'>('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [searchTerm, setSearchTerm] = useState('');

  // Use mock data if no resources provided
  const resources = propResources.length > 0 ? propResources : mockResources;

  const resourceEngine = useMemo(() => 
    new ResourceManagementEngine(resources, projects, tasks), 
    [resources, projects, tasks]
  );

  const [utilization, setUtilization] = useState<any>(null);
  const [skillGaps, setSkillGaps] = useState<ResourceGap[]>([]);
  const [optimizations, setOptimizations] = useState<ResourceOptimization[]>([]);
  const [demandForecast, setDemandForecast] = useState<any>(null);

  useEffect(() => {
    const analyzeResources = async () => {
      const utilizationData = resourceEngine.analyzeResourceUtilization();
      const gaps = resourceEngine.analyzeSkillGaps();
      const opts = resourceEngine.generateOptimizationRecommendations();
      const demand = resourceEngine.predictResourceDemand(selectedTimeframe);

      setUtilization(utilizationData);
      setSkillGaps(gaps);
      setOptimizations(opts);
      setDemandForecast(demand);
    };

    analyzeResources();
  }, [resourceEngine, selectedTimeframe]);

  const filteredResources = useMemo(() => {
    if (!searchTerm) return resources;
    return resources.filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [resources, searchTerm]);

  // Chart data preparation
  const utilizationByDepartment = utilization?.byDepartment ? 
    Object.entries(utilization.byDepartment).map(([dept, util]) => ({ 
      department: dept, 
      utilization: Math.round(util as number) 
    })) : [];

  const skillLevelData = useMemo(() => {
    const skillMap = new Map();
    resources.forEach(resource => {
      resource.skills.forEach(skill => {
        if (!skillMap.has(skill.name)) {
          skillMap.set(skill.name, { skill: skill.name, levels: [], avgLevel: 0 });
        }
        skillMap.get(skill.name).levels.push(skill.level);
      });
    });

    return Array.from(skillMap.values()).map(({ skill, levels }) => ({
      skill: skill.length > 10 ? skill.substring(0, 10) + '...' : skill,
      avgLevel: Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length),
      maxLevel: Math.max(...levels),
      resources: levels.length
    })).slice(0, 10);
  }, [resources]);

  const capacityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-50%', count: 0, color: COLORS.success },
      { range: '50-80%', count: 0, color: COLORS.warning },
      { range: '80-100%', count: 0, color: COLORS.danger },
      { range: '100%+', count: 0, color: COLORS.purple }
    ];

    resources.forEach(resource => {
      const capacity = resource.capacity.current;
      if (capacity <= 50) ranges[0].count++;
      else if (capacity <= 80) ranges[1].count++;
      else if (capacity <= 100) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [resources]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 70) return 'text-green-600 bg-green-100';
    if (utilization <= 100) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 8) return 'bg-green-500';
    if (level >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase().includes('developer')) {
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>;
    }
    if (role.toLowerCase().includes('designer')) {
      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
      </svg>;
    }
    return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Resource Management</h2>
              <p className="text-blue-100">Intelligent workforce optimization and planning</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-blue-100">Total Resources</div>
              <div className="text-2xl font-bold">{resources.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-blue-100">Avg Utilization</div>
              <div className="text-2xl font-bold">{utilization ? Math.round(utilization.overall) : 0}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'allocation', label: 'Allocation', icon: '⚡' },
            { key: 'skills', label: 'Skills', icon: '🎯' },
            { key: 'optimization', label: 'Optimization', icon: '🔧' },
            { key: 'workload', label: 'Workload', icon: '⚖️' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Timeframe Selector */}
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Resources</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {resources.filter(r => r.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overutilized</p>
                    <p className="text-2xl font-bold text-red-600">
                      {utilization?.overutilized?.length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Skill Gaps</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {skillGaps.filter(gap => gap.urgency === 'critical' || gap.urgency === 'high').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Departments</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {new Set(resources.map(r => r.department)).size}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilization by Department */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilization by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={utilizationByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Capacity Distribution */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacity Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={capacityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ range, count }) => `${range}: ${count}`}
                      labelLine={false}
                    >
                      {capacityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resource List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Resource Overview</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResources.slice(0, 10).map((resource) => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {resource.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{resource.name}</div>
                              <div className="text-sm text-gray-500">{resource.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(resource.role)}
                            <span className="text-sm text-gray-900">{resource.role}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {resource.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  resource.capacity.current <= 70 ? 'bg-green-500' :
                                  resource.capacity.current <= 100 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(resource.capacity.current, 100)}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getUtilizationColor(resource.capacity.current)}`}>
                              {resource.capacity.current}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {resource.skills.slice(0, 3).map((skill) => (
                              <span
                                key={skill.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                {skill.name}
                                <span className={`ml-1 w-2 h-2 rounded-full ${getSkillLevelColor(skill.level)}`}></span>
                              </span>
                            ))}
                            {resource.skills.length > 3 && (
                              <span className="text-xs text-gray-500">+{resource.skills.length - 3} more</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            resource.status === 'active' ? 'bg-green-100 text-green-800' :
                            resource.status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {resource.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'skills' && (
          <motion.div
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Skill Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Levels Chart */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Levels Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillLevelData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="skill" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="avgLevel" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="maxLevel" fill={COLORS.success} radius={[4, 4, 0, 0]} fillOpacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Gaps */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critical Skill Gaps</h3>
                <div className="space-y-4">
                  {skillGaps.slice(0, 5).map((gap, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          gap.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                          gap.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                          gap.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {gap.urgency}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Gap: {gap.gap} levels (Required: {gap.requiredLevel}, Current: {gap.currentLevel})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {gap.suggestedActions.slice(0, 2).map((action, actionIndex) => (
                          <span key={actionIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'optimization' && (
          <motion.div
            key="optimization"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Optimization Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {optimizations.map((opt, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            opt.type === 'reallocation' ? 'bg-blue-100 text-blue-600' :
                            opt.type === 'skill_development' ? 'bg-green-100 text-green-600' :
                            opt.type === 'hiring' ? 'bg-purple-100 text-purple-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {opt.type === 'reallocation' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                            {opt.type === 'skill_development' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            {opt.type === 'hiring' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                            {opt.type === 'contract' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">{opt.type.replace('_', ' ')}</h4>
                            <p className="text-sm text-gray-500">{opt.timeline}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{opt.confidence}% confidence</div>
                          <div className="text-xs text-gray-500">Impact: {opt.impact}/100</div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-4">{opt.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-xs text-gray-500">Impact</div>
                          <div className="text-lg font-semibold text-green-600">{opt.impact}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Effort</div>
                          <div className="text-lg font-semibold text-orange-600">{opt.effort}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Cost</div>
                          <div className="text-lg font-semibold text-blue-600">
                            {opt.cost > 0 ? `$${(opt.cost / 1000).toFixed(0)}k` : 'Free'}
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                        Implement Recommendation
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'workload' && (
          <motion.div
            key="workload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <WorkloadOptimizer
              resources={resources}
              projects={projects}
              tasks={tasks}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}