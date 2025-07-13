'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { riskEngine, Risk, RiskRegister, RiskSeverity } from '../../lib/risk/risk-engine';

interface RiskManagementDashboardProps {
  projectId: string;
  className?: string;
}

const SEVERITY_COLORS = {
  critical: '#DC2626',
  high: '#EF4444', 
  medium: '#F59E0B',
  low: '#10B981'
};

const CATEGORY_COLORS = {
  technical: '#3B82F6',
  operational: '#10B981', 
  financial: '#F59E0B',
  strategic: '#8B5CF6',
  external: '#EF4444',
  resource: '#06B6D4',
  compliance: '#84CC16',
  security: '#F97316',
  quality: '#EC4899',
  schedule: '#6366F1',
  scope: '#14B8A6',
  stakeholder: '#A855F7'
};

export default function RiskManagementDashboard({ projectId, className = '' }: RiskManagementDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'matrix' | 'mitigation' | 'analytics'>('overview');
  const [riskRegister, setRiskRegister] = useState<RiskRegister | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showAddRisk, setShowAddRisk] = useState(false);

  useEffect(() => {
    // Initialize or get existing risk register
    let register = riskEngine.getRiskRegister(projectId);
    if (!register) {
      register = riskEngine.createRiskRegister(projectId);
      
      // Add some demo risks
      const demoRisks = [
        {
          title: 'API Performance Degradation',
          description: 'System APIs showing increased response times under load',
          category: 'technical' as const,
          type: 'threat' as const,
          probability: 70,
          impact: { 
            overall: 7, schedule: 6, budget: 5, quality: 8, scope: 4, 
            resources: 6, reputation: 7, strategic: 5, operational: 8, 
            financial: 5, compliance: 3 
          },
          owner: 'tech-lead'
        },
        {
          title: 'Key Developer Departure',
          description: 'Senior developer considering leaving the project',
          category: 'resource' as const,
          type: 'threat' as const,
          probability: 40,
          impact: { 
            overall: 9, schedule: 9, budget: 7, quality: 8, scope: 6, 
            resources: 10, reputation: 5, strategic: 7, operational: 8, 
            financial: 6, compliance: 2 
          },
          owner: 'project-manager'
        },
        {
          title: 'Budget Overrun Risk',
          description: 'Current spending trajectory exceeds allocated budget',
          category: 'financial' as const,
          type: 'threat' as const,
          probability: 60,
          impact: { 
            overall: 8, schedule: 7, budget: 10, quality: 5, scope: 7, 
            resources: 6, reputation: 6, strategic: 8, operational: 5, 
            financial: 10, compliance: 4 
          },
          owner: 'finance-manager'
        },
        {
          title: 'New Technology Adoption',
          description: 'Opportunity to integrate cutting-edge ML capabilities',
          category: 'strategic' as const,
          type: 'opportunity' as const,
          probability: 80,
          impact: { 
            overall: 6, schedule: 4, budget: 3, quality: 7, scope: 8, 
            resources: 5, reputation: 8, strategic: 9, operational: 6, 
            financial: 5, compliance: 3 
          },
          owner: 'cto'
        }
      ];

      demoRisks.forEach(risk => riskEngine.addRisk(projectId, risk));
      register = riskEngine.getRiskRegister(projectId);
    }
    
    setRiskRegister(register);
  }, [projectId]);

  const risks = riskRegister?.risks || [];
  const analytics = riskRegister?.analytics;

  const risksByCategory = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    risks.forEach(risk => {
      categoryData[risk.category] = (categoryData[risk.category] || 0) + 1;
    });
    return Object.entries(categoryData).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#6B7280'
    }));
  }, [risks]);

  const risksBySeverity = useMemo(() => {
    const severityData: { [key: string]: number } = {};
    risks.forEach(risk => {
      severityData[risk.severity] = (severityData[risk.severity] || 0) + 1;
    });
    return Object.entries(severityData).map(([severity, count]) => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      color: SEVERITY_COLORS[severity as RiskSeverity]
    }));
  }, [risks]);

  const riskTrendData = useMemo(() => {
    // Mock trend data - in real app would come from historical data
    return [
      { month: 'Jan', total: 12, critical: 2, high: 4, medium: 4, low: 2 },
      { month: 'Feb', total: 15, critical: 1, high: 5, medium: 6, low: 3 },
      { month: 'Mar', total: 18, critical: 3, high: 6, medium: 7, low: 2 },
      { month: 'Apr', total: risks.length, critical: risks.filter(r => r.severity === 'critical').length, 
        high: risks.filter(r => r.severity === 'high').length, 
        medium: risks.filter(r => r.severity === 'medium').length,
        low: risks.filter(r => r.severity === 'low').length }
    ];
  }, [risks]);

  const riskMatrix = useMemo(() => {
    return risks.map(risk => ({
      id: risk.id,
      title: risk.title,
      probability: risk.probability,
      impact: risk.impact.overall,
      severity: risk.severity,
      category: risk.category
    }));
  }, [risks]);

  const getSeverityIcon = (severity: RiskSeverity) => {
    switch (severity) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      technical: '⚙️',
      operational: '🔄',
      financial: '💰',
      strategic: '🎯',
      external: '🌍',
      resource: '👥',
      compliance: '📋',
      security: '🔒',
      quality: '✅',
      schedule: '⏰',
      scope: '📐',
      stakeholder: '🤝'
    };
    return icons[category] || '📊';
  };

  const handleAddRisk = (riskData: any) => {
    riskEngine.addRisk(projectId, riskData);
    const updatedRegister = riskEngine.getRiskRegister(projectId);
    setRiskRegister(updatedRegister);
    setShowAddRisk(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Risk Management</h2>
              <p className="text-red-100">Identify, assess, and mitigate project risks</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-red-100">Total Risks</div>
              <div className="text-2xl font-bold">{risks.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-red-100">Critical</div>
              <div className="text-2xl font-bold text-red-200">
                {risks.filter(r => r.severity === 'critical').length}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-red-100">Exposure Score</div>
              <div className="text-2xl font-bold">{analytics?.summary.exposureScore.toFixed(1) || '0'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'matrix', label: 'Risk Matrix', icon: '🎯' },
            { key: 'mitigation', label: 'Mitigation', icon: '🛡️' },
            { key: 'analytics', label: 'Analytics', icon: '📈' }
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

        <button
          onClick={() => setShowAddRisk(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          ➕ Add Risk
        </button>
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
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risks by Category */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risks by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={risksByCategory}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ category, count }) => `${category}: ${count}`}
                      labelLine={false}
                    >
                      {risksByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Risks by Severity */}
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risks by Severity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={risksBySeverity}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="severity" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {risksBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Trend */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Trend Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke={SEVERITY_COLORS.critical} strokeWidth={2} name="Critical" />
                  <Line type="monotone" dataKey="high" stroke={SEVERITY_COLORS.high} strokeWidth={2} name="High" />
                  <Line type="monotone" dataKey="medium" stroke={SEVERITY_COLORS.medium} strokeWidth={2} name="Medium" />
                  <Line type="monotone" dataKey="low" stroke={SEVERITY_COLORS.low} strokeWidth={2} name="Low" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Risks Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Risks</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {risks.slice(0, 10).map((risk) => (
                      <tr key={risk.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedRisk(risk)}>
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            <div className="text-lg">{getSeverityIcon(risk.severity)}</div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{risk.title}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">{risk.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getCategoryIcon(risk.category)}</span>
                            <span className="text-sm text-gray-900 capitalize">{risk.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`}
                            style={{ 
                              backgroundColor: `${SEVERITY_COLORS[risk.severity]}20`,
                              color: SEVERITY_COLORS[risk.severity]
                            }}>
                            {risk.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${risk.probability}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">{risk.probability}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${risk.impact.overall * 10}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-900">{risk.impact.overall}/10</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {risk.owner.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            risk.status === 'identified' ? 'bg-gray-100 text-gray-800' :
                            risk.status === 'assessed' ? 'bg-blue-100 text-blue-800' :
                            risk.status === 'mitigated' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {risk.status.replace('_', ' ')}
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

        {selectedTab === 'matrix' && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Risk Matrix */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Matrix</h3>
              <ResponsiveContainer width="100%" height={500}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    type="number" 
                    dataKey="probability" 
                    name="Probability" 
                    unit="%" 
                    domain={[0, 100]}
                    label={{ value: 'Probability (%)', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="impact" 
                    name="Impact" 
                    domain={[0, 10]}
                    label={{ value: 'Impact (1-10)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.title || ''}
                  />
                  <Scatter data={riskMatrix} fill="#8884d8">
                    {riskMatrix.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={SEVERITY_COLORS[entry.severity as RiskSeverity]} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {selectedTab === 'mitigation' && (
          <motion.div
            key="mitigation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Mitigation Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { 
                  label: 'Unmitigated', 
                  count: risks.filter(r => !r.mitigationStrategy).length, 
                  color: 'bg-red-100 text-red-800',
                  icon: '⚠️'
                },
                { 
                  label: 'Planned', 
                  count: risks.filter(r => r.mitigationStrategy?.status === 'planned').length, 
                  color: 'bg-yellow-100 text-yellow-800',
                  icon: '📋'
                },
                { 
                  label: 'In Progress', 
                  count: risks.filter(r => r.mitigationStrategy?.status === 'in_progress').length, 
                  color: 'bg-blue-100 text-blue-800',
                  icon: '🔄'
                },
                { 
                  label: 'Completed', 
                  count: risks.filter(r => r.mitigationStrategy?.status === 'completed').length, 
                  color: 'bg-green-100 text-green-800',
                  icon: '✅'
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{item.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                      <span className="text-xl">{item.icon}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mitigation Actions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Mitigation Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                {risks.filter(r => r.mitigationStrategy).map((risk) => (
                  <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{risk.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.mitigationStrategy?.status === 'completed' ? 'bg-green-100 text-green-800' :
                        risk.mitigationStrategy?.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {risk.mitigationStrategy?.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Approach:</strong> {risk.mitigationStrategy?.approach}</p>
                      <p><strong>Owner:</strong> {risk.mitigationStrategy?.owner}</p>
                      <p><strong>Timeline:</strong> {risk.mitigationStrategy?.timeline}</p>
                      <p><strong>Expected Effectiveness:</strong> {risk.mitigationStrategy?.effectiveness}% risk reduction</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* AI Insights */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
              </div>
              <div className="p-6 space-y-4">
                {analytics?.insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Confidence:</span>
                        <span className="text-sm font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <strong className="text-gray-700">Recommended Actions:</strong>
                        <ul className="mt-1 space-y-1">
                          {insight.actions.map((action, i) => (
                            <li key={i} className="text-gray-600">• {action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Risk Predictions</h3>
              </div>
              <div className="p-6 space-y-4">
                {analytics?.predictions.map((prediction, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{prediction.type.replace('_', ' ')}</h4>
                      <span className="text-sm text-gray-500">
                        {(prediction.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{prediction.description}</p>
                    <div className="text-sm">
                      <strong className="text-gray-700">Timeframe:</strong> {prediction.timeframe}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Risk Modal */}
      {showAddRisk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Risk</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddRisk({
                title: formData.get('title'),
                description: formData.get('description'),
                category: formData.get('category'),
                probability: parseInt(formData.get('probability') as string),
                impact: { 
                  overall: parseInt(formData.get('impact') as string),
                  schedule: 5, budget: 5, quality: 5, scope: 5,
                  resources: 5, reputation: 5, strategic: 5,
                  operational: 5, financial: 5, compliance: 5
                },
                owner: formData.get('owner')
              });
            }}>
              <div className="space-y-4">
                <input
                  name="title"
                  placeholder="Risk title"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Risk description"
                  className="w-full p-2 border border-gray-300 rounded-lg h-20"
                  required
                />
                <select
                  name="category"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical</option>
                  <option value="operational">Operational</option>
                  <option value="financial">Financial</option>
                  <option value="strategic">Strategic</option>
                  <option value="external">External</option>
                </select>
                <input
                  name="probability"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Probability (%)"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="impact"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Impact (1-10)"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
                <input
                  name="owner"
                  placeholder="Risk owner"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Add Risk
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRisk(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}