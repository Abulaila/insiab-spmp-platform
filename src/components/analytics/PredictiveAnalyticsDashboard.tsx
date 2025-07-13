'use client';

import { useState, useEffect } from 'react';

interface PredictiveAnalyticsDashboardProps {
  className?: string;
}

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
}

interface Insight {
  id: string;
  type: 'risk' | 'opportunity' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export default function PredictiveAnalyticsDashboard({ className = '' }: PredictiveAnalyticsDashboardProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1w' | '1m' | '3m' | '6m'>('3m');

  useEffect(() => {
    const generatePredictiveData = () => {
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          metric: 'Project Completion Rate',
          currentValue: 78,
          predictedValue: 85,
          trend: 'increasing',
          confidence: 87,
          timeframe: 'Next 30 days',
          impact: 'high'
        },
        {
          id: '2',
          metric: 'Team Velocity',
          currentValue: 42,
          predictedValue: 48,
          trend: 'increasing',
          confidence: 73,
          timeframe: 'Next sprint',
          impact: 'medium'
        },
        {
          id: '3',
          metric: 'Budget Utilization',
          currentValue: 65,
          predictedValue: 72,
          trend: 'increasing',
          confidence: 91,
          timeframe: 'End of quarter',
          impact: 'high'
        },
        {
          id: '4',
          metric: 'Risk Score',
          currentValue: 23,
          predictedValue: 18,
          trend: 'decreasing',
          confidence: 68,
          timeframe: 'Next 2 weeks',
          impact: 'medium'
        }
      ];

      const mockInsights: Insight[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'Resource Optimization Opportunity',
          description: 'AI analysis shows 15% productivity gain possible by redistributing tasks among team members.',
          confidence: 84,
          impact: 'high',
          actionable: true
        },
        {
          id: '2',
          type: 'risk',
          title: 'Schedule Slip Risk',
          description: 'Project Delta has 68% probability of missing deadline due to dependency bottlenecks.',
          confidence: 76,
          impact: 'high',
          actionable: true
        },
        {
          id: '3',
          type: 'forecast',
          title: 'Sprint Performance Forecast',
          description: 'Next sprint velocity predicted to increase by 12% based on historical patterns.',
          confidence: 71,
          impact: 'medium',
          actionable: false
        },
        {
          id: '4',
          type: 'recommendation',
          title: 'Technology Stack Upgrade',
          description: 'Migrating to new build system could reduce deployment time by 40%.',
          confidence: 89,
          impact: 'medium',
          actionable: true
        }
      ];

      setTimeout(() => {
        setPredictions(mockPredictions);
        setInsights(mockInsights);
        setIsLoading(false);
      }, 300); // REDUCED FROM 1200ms to 300ms for better performance
    };

    generatePredictiveData();
  }, [selectedTimeframe]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'decreasing':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'opportunity':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'forecast':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'risk': return 'bg-red-50 border-red-200';
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'forecast': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
            Processing...
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
            <p className="text-sm text-gray-500">AI-powered forecasting and insights</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(['1w', '1m', '3m', '6m'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {timeframe.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {predictions.map((prediction) => (
          <div key={prediction.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">{prediction.metric}</h4>
              {getTrendIcon(prediction.trend)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {prediction.predictedValue}%
                </span>
                <span className="text-sm text-gray-500">
                  from {prediction.currentValue}%
                </span>
              </div>
              
              <div className="text-xs text-gray-500 mb-2">{prediction.timeframe}</div>
              
              <div className="flex items-center space-x-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {prediction.confidence}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights Section */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4">AI-Generated Insights</h4>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`border rounded-lg p-4 ${getInsightBgColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">{insight.title}</h5>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {insight.confidence}% confidence
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        insight.impact === 'high' ? 'bg-red-500' :
                        insight.impact === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  {insight.actionable && (
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                      Take Action →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last analysis: {new Date().toLocaleTimeString()}
          </div>
          <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}