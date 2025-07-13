'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';
import { mockProjects } from '../../../data/projects';

export default function GanttChartsPage() {
  const [isClientSide, setIsClientSide] = useState(false);
  const waterfallProjects = mockProjects.filter(p => p.methodology === 'waterfall');

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  return (
    <AppLayout title="📊 Gantt Charts" subtitle="Waterfall Project Timeline">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Waterfall Project Timeline</h1>
            <p className="text-gray-600">Gantt chart view of sequential project phases</p>
          </div>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
            {waterfallProjects.length} Waterfall Projects
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Project Timeline</h3>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline Header */}
              <div className="grid grid-cols-12 gap-1 p-4 bg-gray-50 text-sm font-medium text-gray-700">
                <div className="col-span-3">Project</div>
                <div>Jan</div>
                <div>Feb</div>
                <div>Mar</div>
                <div>Apr</div>
                <div>May</div>
                <div>Jun</div>
                <div>Jul</div>
                <div>Aug</div>
                <div>Sep</div>
              </div>
              
              {/* Project Rows */}
              {waterfallProjects.map((project, index) => (
                <div key={project.id} className={`grid grid-cols-12 gap-1 p-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.progress}% complete</div>
                  </div>
                  
                  {/* Timeline bars */}
                  {Array.from({ length: 9 }, (_, i) => {
                    if (!isClientSide) {
                      return (
                        <div key={i} className="h-8 flex items-center">
                          <div className="h-4 w-full rounded bg-gray-200"></div>
                        </div>
                      );
                    }
                    
                    const startMonth = new Date(project.startDate).getMonth();
                    const endMonth = new Date(project.dueDate).getMonth();
                    const currentMonth = i;
                    
                    const isInRange = currentMonth >= startMonth && currentMonth <= endMonth;
                    const isProgress = isInRange && currentMonth <= startMonth + (endMonth - startMonth) * (project.progress / 100);
                    
                    return (
                      <div key={i} className="h-8 flex items-center">
                        {isInRange && (
                          <div className={`h-4 w-full rounded ${
                            isProgress ? 'bg-green-400' : 'bg-gray-300'
                          }`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Phases */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-bold text-blue-900 mb-2">Planning Phase</h4>
            <div className="text-2xl font-bold text-blue-600">25%</div>
            <p className="text-sm text-blue-700">Requirements & Design</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-bold text-yellow-900 mb-2">Development</h4>
            <div className="text-2xl font-bold text-yellow-600">45%</div>
            <p className="text-sm text-yellow-700">Implementation</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-bold text-orange-900 mb-2">Testing</h4>
            <div className="text-2xl font-bold text-orange-600">20%</div>
            <p className="text-sm text-orange-700">QA & Validation</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-bold text-green-900 mb-2">Deployment</h4>
            <div className="text-2xl font-bold text-green-600">10%</div>
            <p className="text-sm text-green-700">Go-Live & Support</p>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Milestones</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Requirements Review</div>
                <div className="text-sm text-gray-600">Security Infrastructure</div>
              </div>
              <div className="text-sm text-blue-600 font-medium">July 20, 2025</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Development Complete</div>
                <div className="text-sm text-gray-600">Data Warehouse Migration</div>
              </div>
              <div className="text-sm text-green-600 font-medium">August 15, 2025</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}