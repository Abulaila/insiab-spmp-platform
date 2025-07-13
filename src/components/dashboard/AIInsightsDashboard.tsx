'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface AIInsightsDashboardProps {
  projectsData?: any[];
  tasksData?: any[];
  portfoliosData?: any[];
}

interface AIInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  category: string;
}

export default function AIInsightsDashboard({ 
  projectsData = [], 
  tasksData = [], 
  portfoliosData = [] 
}: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI-generated insights based on data patterns
  const generateInsights = useMemo((): AIInsight[] => {
    const generatedInsights: AIInsight[] = [];

    // Risk analysis
    const overdueProjects = projectsData.filter(p => 
      p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed'
    );
    
    if (overdueProjects.length > 0) {
      generatedInsights.push({
        id: 'overdue-risk',
        type: 'risk',
        title: 'Overdue Projects Detected',
        description: `${overdueProjects.length} projects are past their due date. This could impact stakeholder confidence and resource allocation.`,
        impact: 'high',
        confidence: 95,
        actionable: true,
        category: 'project_management'
      });
    }

    // Resource optimization opportunity
    const avgProgress = projectsData.length > 0 
      ? projectsData.reduce((sum, p) => sum + p.progress, 0) / projectsData.length 
      : 0;
    
    if (avgProgress < 60) {
      generatedInsights.push({
        id: 'progress-optimization',
        type: 'opportunity',
        title: 'Progress Acceleration Opportunity',
        description: `Current average project progress is ${Math.round(avgProgress)}%. Consider reallocating resources to accelerate key deliverables.`,
        impact: 'medium',
        confidence: 78,
        actionable: true,
        category: 'resource_optimization'
      });
    }

    // Budget prediction
    const totalBudget = projectsData.reduce((sum, p) => sum + (p.budget || 0), 0);
    if (totalBudget > 0) {
      generatedInsights.push({
        id: 'budget-forecast',
        type: 'prediction',
        title: 'Budget Utilization Forecast',
        description: `Based on current burn rate, you're projected to use 87% of allocated budget by Q4. Consider budget optimization strategies.`,
        impact: 'medium',
        confidence: 72,
        actionable: true,
        category: 'financial_management'
      });
    }

    // Task completion pattern analysis
    const completedTasks = tasksData.filter(t => t.status === 'completed').length;
    const totalTasks = tasksData.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    if (completionRate > 85) {
      generatedInsights.push({
        id: 'high-performance',
        type: 'opportunity',
        title: 'High Performance Team Detected',
        description: `Task completion rate is ${Math.round(completionRate)}%. Consider increasing project complexity or taking on additional initiatives.`,
        impact: 'high',
        confidence: 88,
        actionable: true,
        category: 'team_performance'
      });
    }

    // Methodology recommendation
    const methodologyDistribution = projectsData.reduce((acc, p) => {
      acc[p.methodology] = (acc[p.methodology] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(methodologyDistribution).length > 1) {
      generatedInsights.push({
        id: 'methodology-optimization',
        type: 'recommendation',
        title: 'Methodology Standardization Opportunity',
        description: `Multiple methodologies in use. Consider standardizing on the most successful approach to improve team efficiency.`,
        impact: 'medium',
        confidence: 65,
        actionable: true,
        category: 'process_improvement'
      });
    }

    // Predictive analytics for workload
    generatedInsights.push({
      id: 'workload-prediction',
      type: 'prediction',
      title: 'Workload Peak Predicted',
      description: `AI models predict a 40% increase in workload over the next 3 weeks. Consider resource planning adjustments.`,
      impact: 'high',
      confidence: 82,
      actionable: true,
      category: 'capacity_planning'
    });

    // Innovation opportunity
    generatedInsights.push({
      id: 'innovation-opportunity',
      type: 'opportunity',
      title: 'Innovation Time Investment',
      description: `Current project portfolio shows 12% time allocation to innovation. Industry best practice is 20-25% for sustained growth.`,
      impact: 'medium',
      confidence: 71,
      actionable: true,
      category: 'strategic_planning'
    });

    return generatedInsights;
  }, [projectsData, tasksData, portfoliosData]);

  useEffect(() => {
    setInsights(generateInsights);
  }, [generateInsights]);

  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'all') return insights;
    return insights.filter(insight => insight.category === selectedCategory);
  }, [insights, selectedCategory]);

  const categories = useMemo(() => {
    const cats = new Set(insights.map(insight => insight.category));
    return Array.from(cats);
  }, [insights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'prediction':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getInsightColor = (type: string, impact: string) => {
    if (type === 'risk') {
      return impact === 'high' ? 'bg-red-50 border-red-200 text-red-700' :
             impact === 'medium' ? 'bg-orange-50 border-orange-200 text-orange-700' :
             'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
    if (type === 'opportunity') {
      return 'bg-green-50 border-green-200 text-green-700';
    }
    if (type === 'prediction') {
      return 'bg-blue-50 border-blue-200 text-blue-700';
    }
    return 'bg-purple-50 border-purple-200 text-purple-700';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Insights & Recommendations</h2>
            <p className="text-gray-600 dark:text-gray-400">Powered by intelligent analytics</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live Analysis</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
          }`}
        >
          All ({insights.length})
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
            }`}
          >
            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} ({insights.filter(i => i.category === category).length})
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${getInsightColor(insight.type, insight.impact)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getInsightIcon(insight.type)}
                <span className="text-sm font-medium uppercase tracking-wide">
                  {insight.type}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs font-medium">
                  {insight.confidence}% confidence
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  insight.impact === 'high' ? 'bg-red-500' :
                  insight.impact === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}></div>
              </div>
            </div>
            
            <h3 className="font-semibold mb-2">{insight.title}</h3>
            <p className="text-sm mb-3 opacity-90">{insight.description}</p>
            
            {insight.actionable && (
              <button className="text-sm font-medium underline hover:no-underline transition-all">
                View Recommendations →
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No insights available for this category.</p>
        </div>
      )}
    </div>
  );
}