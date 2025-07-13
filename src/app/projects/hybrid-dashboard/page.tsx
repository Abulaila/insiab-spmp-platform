'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';
import { mockProjects } from '../../../data/projects';

export default function HybridDashboardPage() {
  const [isClientSide, setIsClientSide] = useState(false);
  const hybridProjects = mockProjects.filter(p => p.methodology === 'hybrid');

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  return (
    <AppLayout title="🎯 Hybrid Dashboard" subtitle="Flexible Project Management">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Hybrid Project Dashboard</h1>
            <p className="text-gray-600">Flexible methodology combining best practices</p>
          </div>
          <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full font-medium">
            {hybridProjects.length} Hybrid Projects
          </div>
        </div>

        {/* Methodology Mix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Methodology Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Agile Components</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Waterfall Elements</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Project Velocity</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">72%</div>
              <p className="text-gray-600">Average completion rate</p>
              <div className="mt-4 flex justify-center space-x-4 text-sm">
                <div className="text-green-600">↗ +8% this month</div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hybridProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{project.name}</h4>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Hybrid Phases */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">Sprint 3</div>
                  <div className="text-sm text-blue-700">Current Iteration</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">Phase 2</div>
                  <div className="text-sm text-green-700">Development</div>
                </div>
              </div>

              {/* Team & Timeline */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Team:</span>
                  <div className="flex -space-x-1">
                    {project.teamMembers.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="w-6 h-6 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs border border-white"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-gray-500">
                  Due: {isClientSide ? new Date(project.dueDate).toLocaleDateString() : project.dueDate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hybrid Best Practices */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Hybrid Methodology Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-semibold mb-1">Agile Flexibility</div>
              <div className="text-sm opacity-90">Iterative development and rapid feedback</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🏗️</div>
              <div className="font-semibold mb-1">Structured Planning</div>
              <div className="text-sm opacity-90">Waterfall milestone tracking</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="font-semibold mb-1">Best of Both</div>
              <div className="text-sm opacity-90">Adaptive framework for complex projects</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}