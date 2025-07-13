'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Resource, ResourceManagementEngine } from '../../lib/resource-management/resource-engine';

interface WorkloadOptimizerProps {
  resources: Resource[];
  projects: any[];
  tasks: any[];
  className?: string;
}

interface OptimizationScenario {
  id: string;
  name: string;
  description: string;
  impact: {
    efficiency: number;
    satisfaction: number;
    costReduction: number;
    timeToComplete: number;
  };
  changes: ResourceChange[];
  confidence: number;
}

interface ResourceChange {
  resourceId: string;
  resourceName: string;
  changeType: 'reallocation' | 'skill_training' | 'workload_adjustment' | 'team_change';
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  effort: number; // 1-10 scale
}

export default function WorkloadOptimizer({
  resources,
  projects,
  tasks,
  className = ''
}: WorkloadOptimizerProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [scenarios, setScenarios] = useState<OptimizationScenario[]>([]);

  const engine = useMemo(() => new ResourceManagementEngine(resources, projects, tasks), [resources, projects, tasks]);

  // Generate optimization scenarios
  useEffect(() => {
    const generateScenarios = async () => {
      setOptimizing(true);
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedScenarios: OptimizationScenario[] = [
        {
          id: 'balanced-reallocation',
          name: 'Balanced Workload Reallocation',
          description: 'Redistribute tasks across team members to achieve optimal utilization while maintaining project timelines.',
          impact: {
            efficiency: 23,
            satisfaction: 18,
            costReduction: 12,
            timeToComplete: -8
          },
          changes: [
            {
              resourceId: '1',
              resourceName: 'Alice Johnson',
              changeType: 'workload_adjustment',
              description: 'Reduce workload from 95% to 85% by redistributing 2 high-priority tasks',
              impact: 'positive',
              effort: 3
            },
            {
              resourceId: '2',
              resourceName: 'Bob Smith',
              changeType: 'reallocation',
              description: 'Take on additional React development tasks to utilize 85% capacity',
              impact: 'positive',
              effort: 2
            },
            {
              resourceId: '3',
              resourceName: 'Carol Davis',
              changeType: 'skill_training',
              description: 'Upskill in Node.js to support backend development initiatives',
              impact: 'positive',
              effort: 6
            }
          ],
          confidence: 87
        },
        {
          id: 'skill-focused-optimization',
          name: 'Skill-Focused Team Optimization',
          description: 'Reorganize teams based on skill strengths and provide targeted training to close critical gaps.',
          impact: {
            efficiency: 31,
            satisfaction: 25,
            costReduction: 8,
            timeToComplete: -15
          },
          changes: [
            {
              resourceId: '4',
              resourceName: 'David Thompson',
              changeType: 'team_change',
              description: 'Move to security-focused project team to leverage expertise',
              impact: 'positive',
              effort: 4
            },
            {
              resourceId: '5',
              resourceName: 'Emily Johnson',
              changeType: 'skill_training',
              description: 'Advanced React training to become team technical lead',
              impact: 'positive',
              effort: 7
            },
            {
              resourceId: '6',
              resourceName: 'Frank Wilson',
              changeType: 'reallocation',
              description: 'Transition from low-impact tasks to high-value development work',
              impact: 'positive',
              effort: 3
            }
          ],
          confidence: 92
        },
        {
          id: 'capacity-maximization',
          name: 'Capacity Maximization Strategy',
          description: 'Maximize team output by optimally utilizing available capacity while preventing burnout.',
          impact: {
            efficiency: 28,
            satisfaction: 15,
            costReduction: 20,
            timeToComplete: -12
          },
          changes: [
            {
              resourceId: '7',
              resourceName: 'Grace Lee',
              changeType: 'workload_adjustment',
              description: 'Increase capacity utilization from 65% to 80% with additional projects',
              impact: 'positive',
              effort: 2
            },
            {
              resourceId: '8',
              resourceName: 'Henry Martinez',
              changeType: 'reallocation',
              description: 'Redistribute overflow work from overutilized team members',
              impact: 'positive',
              effort: 3
            },
            {
              resourceId: '1',
              resourceName: 'Alice Johnson',
              changeType: 'workload_adjustment',
              description: 'Reduce overtime work to prevent burnout risk',
              impact: 'positive',
              effort: 2
            }
          ],
          confidence: 82
        }
      ];

      setScenarios(generatedScenarios);
      setOptimizing(false);
    };

    if (resources.length > 0) {
      generateScenarios();
    }
  }, [resources, projects, tasks]);

  const getImpactColor = (value: number) => {
    if (value > 20) return 'text-green-600 bg-green-100';
    if (value > 10) return 'text-blue-600 bg-blue-100';
    if (value > 0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'reallocation':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>;
      case 'skill_training':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>;
      case 'workload_adjustment':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>;
      case 'team_change':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>;
      default:
        return null;
    }
  };

  if (optimizing) {
    return (
      <div className={`bg-white rounded-lg p-8 border border-gray-200 shadow-sm ${className}`}>
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <motion.svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </motion.svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Optimizing Workload</h3>
            <p className="text-gray-600">AI is analyzing your team structure and generating optimization scenarios...</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Workload Optimization</h2>
            <p className="text-indigo-100">AI-generated scenarios to maximize team efficiency</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100">Scenarios Generated</div>
            <div className="text-3xl font-bold">{scenarios.length}</div>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {scenarios.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg border-2 cursor-pointer transition-all ${
              selectedScenario === scenario.id
                ? 'border-blue-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
            onClick={() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
                <div className="text-sm font-medium text-blue-600">{scenario.confidence}% confidence</div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">{scenario.description}</p>
              
              {/* Impact Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className={`text-lg font-bold px-2 py-1 rounded-md ${getImpactColor(scenario.impact.efficiency)}`}>
                    +{scenario.impact.efficiency}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Efficiency</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold px-2 py-1 rounded-md ${getImpactColor(scenario.impact.satisfaction)}`}>
                    +{scenario.impact.satisfaction}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Satisfaction</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold px-2 py-1 rounded-md ${getImpactColor(scenario.impact.costReduction)}`}>
                    +{scenario.impact.costReduction}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Cost Reduction</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-lg font-bold px-2 py-1 rounded-md ${scenario.impact.timeToComplete < 0 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'}`}>
                    {scenario.impact.timeToComplete}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Time to Complete</div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{scenario.changes.length} changes</span>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    {selectedScenario === scenario.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed Changes */}
            <AnimatePresence>
              {selectedScenario === scenario.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recommended Changes</h4>
                    <div className="space-y-3">
                      {scenario.changes.map((change, changeIndex) => (
                        <div key={changeIndex} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            change.changeType === 'reallocation' ? 'bg-blue-100 text-blue-600' :
                            change.changeType === 'skill_training' ? 'bg-green-100 text-green-600' :
                            change.changeType === 'workload_adjustment' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                            {getChangeTypeIcon(change.changeType)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-900">{change.resourceName}</h5>
                              <div className="flex items-center space-x-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  change.impact === 'positive' ? 'bg-green-500' :
                                  change.impact === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></span>
                                <span className="text-xs text-gray-500">Effort: {change.effort}/10</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{change.description}</p>
                            <div className="text-xs text-gray-500 mt-1 capitalize">
                              {change.changeType.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Implement Scenario
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                        Simulate
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Optimization Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Auto-Balance</h4>
            </div>
            <p className="text-sm text-gray-600">Automatically redistribute workload to achieve optimal utilization</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Skill Gap Analysis</h4>
            </div>
            <p className="text-sm text-gray-600">Identify critical skill gaps and recommend training programs</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900">Capacity Planning</h4>
            </div>
            <p className="text-sm text-gray-600">Forecast future resource needs and plan hiring strategies</p>
          </button>
        </div>
      </div>
    </div>
  );
}