'use client';

import { motion } from 'framer-motion';
import { SortConfig } from '../../../app/projects/page';
import { ProjectWithTeamMembers } from '../../../lib/database';

interface ProjectKanbanViewProps {
  projects: ProjectWithTeamMembers[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function ProjectKanbanView({
  projects,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig
}: ProjectKanbanViewProps) {

  const columns = [
    { id: 'active', title: 'Active', status: 'active', color: 'bg-green-50 border-green-200' },
    { id: 'on_hold', title: 'On Hold', status: 'on_hold', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'blocked', title: 'Blocked', status: 'blocked', color: 'bg-red-50 border-red-200' },
    { id: 'completed', title: 'Completed', status: 'completed', color: 'bg-blue-50 border-blue-200' }
  ];

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => project.status === status);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'border-l-red-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-green-500',
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-500';
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column, columnIndex) => {
          const columnProjects = getProjectsByStatus(column.status);
          
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columnIndex * 0.1, duration: 0.3 }}
              className={`rounded-lg border-2 ${column.color} min-h-[600px]`}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-sm font-medium">
                    {columnProjects.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="p-4 space-y-3">
                {columnProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (columnIndex * 0.1) + (index * 0.05), duration: 0.2 }}
                    className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(project.priority)} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                      selectedProjects.includes(project.id) ? 'ring-2 ring-brand-300' : ''
                    }`}
                    onClick={() => {
                      if (selectedProjects.includes(project.id)) {
                        setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                      } else {
                        setSelectedProjects([...selectedProjects, project.id]);
                      }
                    }}
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {project.name}
                      </h4>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Project Description */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            project.progress >= 80 ? 'bg-green-500' :
                            project.progress >= 50 ? 'bg-blue-500' :
                            project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Project Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>Due: {formatDate(project.dueDate)}</span>
                      <span className="capitalize">{project.priority}</span>
                    </div>

                    {/* Team Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {project.teamMembers.slice(0, 3).map((member, idx) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-xs font-medium text-brand-700 dark:text-brand-300 border-2 border-white dark:border-gray-800"
                            title={member.user.name}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-800">
                            +{project.teamMembers.length - 3}
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {project.tags.length > 0 && (
                        <div className="flex gap-1">
                          {project.tags.slice(0, 2).map((tagObj, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                            >
                              {tagObj.tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Methodology Badge */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {project.methodology} methodology
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Empty State */}
                {columnProjects.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H6" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">No {column.title.toLowerCase()} projects</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}