'use client';

import { useState, useEffect } from 'react';

interface AIInsightsDashboardProps {
  className?: string;
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  timestamp: Date;
}

export default function AIInsightsDashboard({ className = '' }: AIInsightsDashboardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateInsights = () => {
      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'warning',
          title: 'Project Deadline Risk',
          description: 'Project Alpha has a 73% risk of missing its deadline based on current velocity.',
          confidence: 73,
          action: 'Consider reallocating resources or adjusting scope',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'success',
          title: 'Resource Optimization',
          description: 'Team productivity increased by 23% after implementing agile methodology.',
          confidence: 91,
          action: 'Apply agile practices to other projects',
          timestamp: new Date()
        },
        {
          id: '3',
          type: 'info',
          title: 'Budget Forecast',
          description: 'Current spending trend suggests 15% budget savings for Q4.',
          confidence: 67,
          action: 'Review budget allocation for upcoming projects',
          timestamp: new Date()
        },
        {
          id: '4',
          type: 'critical',
          title: 'Bottleneck Detected',
          description: 'Code review process is causing 2-day delays across 4 active projects.',
          confidence: 89,
          action: 'Implement automated code review tools',
          timestamp: new Date()
        }
      ];

      setTimeout(() => {
        setInsights(mockInsights);
        setIsLoading(false);
      }, 200); // REDUCED FROM 1500ms to 200ms for better performance
    };

    generateInsights();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-200';
      case 'warning': return 'border-yellow-200';
      case 'critical': return 'border-red-200';
      default: return 'border-blue-200';
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'warning': return 'bg-yellow-50';
      case 'critical': return 'bg-red-50';
      default: return 'bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Analyzing...
          </div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
            <p className="text-sm text-gray-500">Real-time project intelligence</p>
          </div>
        </div>
        <div className="flex items-center text-sm text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Active
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`border-l-4 p-4 rounded-lg ${getInsightBorderColor(insight.type)} ${getInsightBgColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {insight.confidence}% confidence
                    </span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                {insight.action && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 italic">Recommended: {insight.action}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Apply Suggestion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Insights
          </button>
        </div>
      </div>
    </div>
  );
}