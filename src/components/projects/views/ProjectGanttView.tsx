'use client';

import { motion } from 'framer-motion';
import { SortConfig } from '../../../app/projects/page';
import { ProjectWithTeamMembers } from '../../../lib/database';

interface ProjectGanttViewProps {
  projects: ProjectWithTeamMembers[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function ProjectGanttView({
  projects,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig
}: ProjectGanttViewProps) {

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Simple gantt timeline calculation
  const getTimelinePosition = (startDate: string, dueDate: string, minDate: Date, maxDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(dueDate);
    const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const startOffset = (start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
    const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    
    return {
      left: (startOffset / totalDays) * 100,
      width: (duration / totalDays) * 100
    };
  };

  // Calculate timeline boundaries
  const allDates = projects.flatMap(p => [new Date(p.startDate), new Date(p.dueDate)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // Add some padding to the timeline
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500',
      completed: 'bg-blue-500',
      on_hold: 'bg-yellow-500',
      blocked: 'bg-red-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="p-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline View</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>From: {formatDate(minDate.toISOString())}</span>
            <span>To: {formatDate(maxDate.toISOString())}</span>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="grid grid-cols-12 gap-2 mb-4">
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date(minDate);
            date.setDate(date.getDate() + (i * ((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / 12));
            return (
              <div key={i} className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="space-y-3">
        {projects.map((project, index) => {
          const position = getTimelinePosition(project.startDate, project.dueDate, minDate, maxDate);
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => {
                    if (selectedProjects.includes(project.id)) {
                      setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                    } else {
                      setSelectedProjects([...selectedProjects, project.id]);
                    }
                  }}
                  className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500 mr-3"
                />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(project.startDate)} - {formatDate(project.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{project.progress}%</div>
                </div>
              </div>

              {/* Timeline Bar */}
              <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`absolute top-0 h-full rounded-lg ${getStatusColor(project.status)} transition-all duration-500`}
                  style={{
                    left: `${position.left}%`,
                    width: `${position.width}%`
                  }}
                >
                  {/* Progress overlay */}
                  <div
                    className="h-full bg-white bg-opacity-30 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                
                {/* Timeline markers */}
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div
                    className="w-2 h-2 bg-gray-800 dark:bg-white rounded-full opacity-60"
                    style={{ marginLeft: `${position.left}%` }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-800 dark:bg-white rounded-full opacity-60 ml-auto"
                    style={{ marginRight: `${100 - position.left - position.width}%` }}
                  />
                </div>
              </div>

              {/* Project Details */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span className="capitalize">{project.status.replace('_', ' ')}</span>
                  <span className="capitalize">{project.priority} priority</span>
                  <span>{project.teamMembers.length} team members</span>
                </div>
                <div className="flex items-center space-x-2">
                  {project.tags.slice(0, 2).map((tagObj, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {tagObj.tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">On Hold</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded opacity-50"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">Progress Overlay</span>
          </div>
        </div>
      </div>
    </div>
  );
}