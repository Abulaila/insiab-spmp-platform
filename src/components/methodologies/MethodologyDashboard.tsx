'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { methodologyEngine, Methodology, ProjectMethodology } from '../../lib/methodologies/methodology-engine';

interface MethodologyDashboardProps {
  projectId?: string;
  className?: string;
}

export default function MethodologyDashboard({ projectId, className = '' }: MethodologyDashboardProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'selector' | 'progress' | 'compliance'>('overview');
  const [methodologies, setMethodologies] = useState<Methodology[]>([]);
  const [selectedMethodology, setSelectedMethodology] = useState<string>('agile-scrum');
  const [projectMethodology, setProjectMethodology] = useState<ProjectMethodology | null>(null);

  useEffect(() => {
    // Load available methodologies
    const availableMethodologies = methodologyEngine.listMethodologies();
    setMethodologies(availableMethodologies);

    // Load project methodology if projectId provided
    if (projectId) {
      const projMeth = methodologyEngine.getProjectMethodology(projectId);
      if (projMeth) {
        setProjectMethodology(projMeth);
        setSelectedMethodology(projMeth.methodologyId);
      }
    }
  }, [projectId]);

  const currentMethodology = useMemo(() => {
    return methodologyEngine.getMethodology(selectedMethodology);
  }, [selectedMethodology]);

  const handleApplyMethodology = () => {
    if (!projectId) return;
    
    const applied = methodologyEngine.applyMethodologyToProject(projectId, selectedMethodology);
    setProjectMethodology(applied);
  };

  const getMethodologyIcon = (category: string) => {
    switch (category) {
      case 'agile': return '🏃‍♂️';
      case 'traditional': return '📋';
      case 'lean': return '⚡';
      case 'hybrid': return '🔄';
      default: return '⚙️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'agile': return 'bg-blue-100 text-blue-800';
      case 'traditional': return 'bg-green-100 text-green-800';
      case 'lean': return 'bg-purple-100 text-purple-800';
      case 'hybrid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      case 'not_started': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Project Methodologies</h2>
              <p className="text-purple-100">Choose and manage your project methodology</p>
            </div>
          </div>

          {projectId && (
            <div className="text-right">
              <div className="text-sm text-purple-100">Current Methodology</div>
              <div className="text-xl font-semibold">
                {currentMethodology?.name || 'None Selected'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Overview', icon: '📋' },
          { key: 'selector', label: 'Methodology Selector', icon: '🎯' },
          { key: 'progress', label: 'Progress Tracking', icon: '📈' },
          { key: 'compliance', label: 'Compliance', icon: '✅' }
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
            {/* Available Methodologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methodologies.map((methodology) => (
                <div key={methodology.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getMethodologyIcon(methodology.category)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{methodology.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(methodology.category)}`}>
                          {methodology.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{methodology.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phases:</span>
                      <span className="font-medium">{methodology.phases.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Roles:</span>
                      <span className="font-medium">{methodology.roles.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ceremonies:</span>
                      <span className="font-medium">{methodology.ceremonies.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => setSelectedMethodology(methodology.id)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    {projectId && (
                      <button 
                        onClick={() => {
                          setSelectedMethodology(methodology.id);
                          handleApplyMethodology();
                        }}
                        className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === 'selector' && currentMethodology && (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Methodology Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{getMethodologyIcon(currentMethodology.category)}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{currentMethodology.name}</h3>
                      <p className="text-gray-600">{currentMethodology.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentMethodology.category)}`}>
                    {currentMethodology.category} • v{currentMethodology.version}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Principles */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Core Principles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentMethodology.principles.map((principle, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{principle}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phases */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Methodology Phases</h4>
                  <div className="space-y-3">
                    {currentMethodology.phases.map((phase, index) => (
                      <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <h5 className="font-medium text-gray-900">{phase.name}</h5>
                          </div>
                          <div className="text-sm text-gray-500">
                            {phase.duration.type === 'fixed' ? `${phase.duration.estimatedDays} days` :
                             phase.duration.type === 'timeboxed' ? `${phase.duration.timebox} days` :
                             'Variable duration'}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Objectives:</span>
                            <ul className="mt-1 space-y-1">
                              {phase.objectives.slice(0, 2).map((obj, i) => (
                                <li key={i} className="text-gray-600">• {obj}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Deliverables:</span>
                            <ul className="mt-1 space-y-1">
                              {phase.deliverables.slice(0, 2).map((del, i) => (
                                <li key={i} className="text-gray-600">• {del}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Roles */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Roles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentMethodology.roles.map((role) => (
                      <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">{role.name}</h5>
                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                        <div className="text-xs">
                          <span className="font-medium text-gray-700">Key Responsibilities:</span>
                          <ul className="mt-1 space-y-1">
                            {role.responsibilities.slice(0, 2).map((resp, i) => (
                              <li key={i} className="text-gray-600">• {resp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {projectId && (
                  <div className="pt-4 border-t border-gray-200">
                    <button 
                      onClick={handleApplyMethodology}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      Apply {currentMethodology.name} to Project
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'progress' && projectMethodology && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Progress Overview */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{projectMethodology.progress.overallProgress.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{projectMethodology.progress.completedPhases.length}</div>
                  <div className="text-sm text-gray-500">Completed Phases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentMethodology?.phases.length || 0}</div>
                  <div className="text-sm text-gray-500">Total Phases</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">{projectMethodology.progress.overallProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${projectMethodology.progress.overallProgress}%` }}
                  />
                </div>
              </div>

              {/* Phase Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Phase Status</h4>
                <div className="space-y-3">
                  {currentMethodology?.phases.map((phase, index) => {
                    const phaseProgress = projectMethodology.progress.phaseProgress[phase.id];
                    const isCompleted = projectMethodology.progress.completedPhases.includes(phase.id);
                    const isCurrent = projectMethodology.progress.currentPhase === phase.id;
                    
                    return (
                      <div key={phase.id} className="flex items-center space-x-4">
                        <div className={`w-4 h-4 rounded-full ${
                          isCompleted ? 'bg-green-500' :
                          isCurrent ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                              {phase.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {phaseProgress ? `${phaseProgress.progressPercentage}%` : '0%'}
                            </span>
                          </div>
                          {phaseProgress && (
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className={`h-2 rounded-full ${getPhaseStatusColor(phaseProgress.status || 'not_started')}`}
                                style={{ width: `${phaseProgress.progressPercentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'compliance' && projectMethodology && (
          <motion.div
            key="compliance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Compliance Overview */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodology Compliance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    projectMethodology.compliance.overallScore >= 80 ? 'text-green-600' :
                    projectMethodology.compliance.overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {projectMethodology.compliance.overallScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Overall Compliance</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{projectMethodology.compliance.violations.length}</div>
                  <div className="text-sm text-gray-500">Violations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{projectMethodology.compliance.recommendations.length}</div>
                  <div className="text-sm text-gray-500">Recommendations</div>
                </div>
              </div>

              {/* Violations */}
              {projectMethodology.compliance.violations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Compliance Violations</h4>
                  <div className="space-y-3">
                    {projectMethodology.compliance.violations.map((violation, index) => (
                      <div key={index} className={`border rounded-lg p-4 ${
                        violation.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        violation.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        violation.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-gray-300 bg-gray-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{violation.description}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            violation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            violation.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {violation.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{violation.impact}</p>
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Remediation:</span>
                          <ul className="mt-1 space-y-1">
                            {violation.remediation.map((remedy, i) => (
                              <li key={i} className="text-gray-600">• {remedy}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {projectMethodology.compliance.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {projectMethodology.compliance.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}