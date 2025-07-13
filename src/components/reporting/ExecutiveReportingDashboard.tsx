'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ScatterChart, Scatter,
  ComposedChart, Legend
} from 'recharts';
import { reportEngine, ReportTemplate, BusinessIntelligence, KPI } from '../../lib/reporting/report-engine';

interface ExecutiveReportingDashboardProps {
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

// Mock executive data
const executiveKPIs = [
  {
    id: 'portfolio-value',
    name: 'Portfolio Value',
    value: 24500000,
    target: 25000000,
    trend: 12.5,
    status: 'good' as const,
    unit: 'USD',
    description: 'Total portfolio value across all projects',
    category: 'Financial'
  },
  {
    id: 'project-success-rate',
    name: 'Project Success Rate',
    value: 87.3,
    target: 90,
    trend: 5.2,
    status: 'good' as const,
    unit: '%',
    description: 'Percentage of projects delivered on time and on budget',
    category: 'Performance'
  },
  {
    id: 'resource-utilization',
    name: 'Resource Utilization',
    value: 82.1,
    target: 85,
    trend: -2.1,
    status: 'warning' as const,
    unit: '%',
    description: 'Overall resource utilization across teams',
    category: 'Operations'
  },
  {
    id: 'roi',
    name: 'Portfolio ROI',
    value: 18.7,
    target: 20,
    trend: 8.3,
    status: 'excellent' as const,
    unit: '%',
    description: 'Return on investment for project portfolio',
    category: 'Financial'
  }
];

const performanceData = [
  { month: 'Jan', projects: 23, budget: 2100000, delivered: 20, onTime: 18 },
  { month: 'Feb', projects: 25, budget: 2300000, delivered: 22, onTime: 20 },
  { month: 'Mar', projects: 28, budget: 2500000, delivered: 25, onTime: 22 },
  { month: 'Apr', projects: 30, budget: 2800000, delivered: 27, onTime: 24 },
  { month: 'May', projects: 32, budget: 3100000, delivered: 30, onTime: 27 },
  { month: 'Jun', projects: 35, budget: 3400000, delivered: 32, onTime: 29 },
  { month: 'Jul', projects: 38, budget: 3700000, delivered: 35, onTime: 32 }
];

const portfolioDistribution = [
  { name: 'Digital Transformation', value: 35, color: COLORS.primary },
  { name: 'Infrastructure', value: 25, color: COLORS.success },
  { name: 'Innovation', value: 20, color: COLORS.purple },
  { name: 'Compliance', value: 12, color: COLORS.warning },
  { name: 'Research', value: 8, color: COLORS.teal }
];

const riskAnalysis = [
  { category: 'Budget', high: 5, medium: 12, low: 23 },
  { category: 'Schedule', high: 8, medium: 15, low: 17 },
  { category: 'Quality', high: 3, medium: 8, low: 29 },
  { category: 'Resources', high: 6, medium: 14, low: 20 },
  { category: 'Technology', high: 4, medium: 10, low: 26 }
];

const executiveInsights = [
  {
    id: 'budget-variance',
    type: 'alert',
    title: 'Budget Variance Alert',
    description: 'Q2 budget variance exceeded 5% threshold in Digital Transformation portfolio',
    priority: 'high',
    impact: 8.5,
    recommendation: 'Reallocate resources from Innovation to Digital Transformation projects'
  },
  {
    id: 'delivery-trend',
    type: 'trend',
    title: 'Positive Delivery Trend',
    description: 'On-time delivery rate improved by 15% over the last quarter',
    priority: 'medium',
    impact: 7.2,
    recommendation: 'Document and replicate successful project management practices'
  },
  {
    id: 'resource-optimization',
    type: 'opportunity',
    title: 'Resource Optimization Opportunity',
    description: 'Infrastructure team showing 15% underutilization',
    priority: 'medium',
    impact: 6.8,
    recommendation: 'Cross-train infrastructure team members for digital transformation projects'
  }
];

export default function ExecutiveReportingDashboard({ className = '' }: ExecutiveReportingDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'portfolio' | 'insights'>('overview');
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [businessIntelligence, setBusinessIntelligence] = useState<BusinessIntelligence | null>(null);

  useEffect(() => {
    // Initialize report templates
    const templates = [
      {
        name: 'Executive Summary',
        description: 'High-level overview for C-suite executives',
        category: 'Executive',
        type: 'dashboard' as const,
        config: {
          dataSources: [],
          visualizations: [],
          layout: { type: 'grid' as const, columns: 3, gap: 16, padding: 24, responsive: true },
          styling: { theme: 'light' as const, fontFamily: 'Inter', fontSize: 14, colors: { primary: [], secondary: [], accent: [], neutral: [] }, background: { type: 'solid' as const, value: '#ffffff' } },
          parameters: []
        },
        filters: [],
        permissions: ['executive', 'admin'],
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
    ];

    const createdTemplates = templates.map(template => reportEngine.createTemplate(template));
    setReportTemplates(createdTemplates);

    // Generate business intelligence
    const mockData = Array.from({ length: 100 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.random() * 1000 + 500,
      category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    }));

    const bi = reportEngine.generateBusinessIntelligence(mockData);
    setBusinessIntelligence(bi);
  }, []);

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend < 0) {
      return (
        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Executive Reporting</h2>
              <p className="text-slate-300">Strategic insights and business intelligence</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-slate-300">Last Updated</div>
              <div className="text-lg font-semibold">{new Date().toLocaleString()}</div>
            </div>
            <button className="bg-white text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors font-medium">
              📊 Generate Report
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📈' },
            { key: 'performance', label: 'Performance', icon: '🎯' },
            { key: 'portfolio', label: 'Portfolio', icon: '📋' },
            { key: 'insights', label: 'Insights', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedView(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === tab.key
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
        {selectedView === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Executive KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {executiveKPIs.map((kpi) => (
                <div key={kpi.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-gray-600">{kpi.name}</h3>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKPIStatusColor(kpi.status)}`}>
                      {kpi.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-gray-900">
                      {kpi.unit === 'USD' ? formatCurrency(kpi.value) : `${kpi.value.toFixed(1)}${kpi.unit}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      Target: {kpi.unit === 'USD' ? formatCurrency(kpi.target) : `${kpi.target.toFixed(1)}${kpi.unit}`}
                    </div>
                    <div className={`text-sm font-medium ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.trend >= 0 ? '+' : ''}{kpi.trend.toFixed(1)}% vs last period
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Performance Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="projects" fill={COLORS.primary} name="Total Projects" />
                    <Line yAxisId="right" type="monotone" dataKey="onTime" stroke={COLORS.success} strokeWidth={3} name="On-Time Delivery" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Executive Insights */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Executive Insights</h3>
              </div>
              <div className="p-6 space-y-4">
                {executiveInsights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          insight.type === 'alert' ? 'bg-red-100 text-red-600' :
                          insight.type === 'trend' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {insight.type === 'alert' && '⚠️'}
                          {insight.type === 'trend' && '📈'}
                          {insight.type === 'opportunity' && '💡'}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.priority} priority
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Impact: {insight.impact}/10</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs font-medium text-gray-600 mb-1">Recommendation:</div>
                      <div className="text-sm text-gray-800">{insight.recommendation}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedView === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Budget vs Actual */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="budget" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} name="Budget" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Analysis */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="high" stackId="risk" fill={COLORS.danger} name="High Risk" />
                  <Bar dataKey="medium" stackId="risk" fill={COLORS.warning} name="Medium Risk" />
                  <Bar dataKey="low" stackId="risk" fill={COLORS.success} name="Low Risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {selectedView === 'portfolio' && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {portfolioDistribution.map((portfolio) => (
                <div key={portfolio.name} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
                    <div className="text-2xl font-bold" style={{ color: portfolio.color }}>
                      {portfolio.value}%
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Projects:</span>
                      <span className="font-medium">{Math.floor(portfolio.value * 0.8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">{formatCurrency(portfolio.value * 100000)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ROI:</span>
                      <span className="font-medium text-green-600">{(15 + Math.random() * 10).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ width: `${portfolio.value}%`, backgroundColor: portfolio.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedView === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {businessIntelligence && (
              <>
                {/* AI-Generated Insights */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Business Insights</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {businessIntelligence.insights.map((insight) => (
                      <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Confidence:</span>
                            <span className="text-sm font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                        <div className="space-y-2">
                          {insight.recommendations.map((rec, index) => (
                            <div key={index} className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded">
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
                  </div>
                  <div className="p-6">
                    {businessIntelligence.predictions.map((prediction) => (
                      <div key={prediction.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{prediction.metric} Forecast</h4>
                          <span className="text-sm text-gray-500">Confidence: {(prediction.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={prediction.values}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis dataKey="period" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="upper" fill={COLORS.primary} fillOpacity={0.1} stroke="none" />
                            <Area type="monotone" dataKey="lower" fill="#ffffff" fillOpacity={1} stroke="none" />
                            <Line type="monotone" dataKey="predicted" stroke={COLORS.primary} strokeWidth={2} name="Predicted" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Custom Report</h4>
            </div>
            <p className="text-sm text-gray-600">Create a custom executive report with specific metrics</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Export Data</h4>
            </div>
            <p className="text-sm text-gray-600">Export executive data to Excel or PDF format</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 7h16M4 12h16M4 17h10" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Schedule Reports</h4>
            </div>
            <p className="text-sm text-gray-600">Set up automated report delivery schedules</p>
          </button>
        </div>
      </div>
    </div>
  );
}