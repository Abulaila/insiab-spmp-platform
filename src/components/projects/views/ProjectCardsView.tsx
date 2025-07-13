'use client';

import { motion } from 'framer-motion';
import { SortConfig } from '../../../app/projects/page';
import { ProjectWithTeamMembers } from '../../../lib/database';
import Link from 'next/link';

interface ProjectCardsViewProps {
  projects: ProjectWithTeamMembers[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function ProjectCardsView({
  projects,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig
}: ProjectCardsViewProps) {

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getMethodologyIcon = (methodology: string) => {
    const icons = {
      agile: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      waterfall: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
      hybrid: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      )
    };
    return icons[methodology as keyof typeof icons] || null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  const handleProjectSelect = (projectId: string) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all duration-200 hover:shadow-lg group ${
              selectedProjects.includes(project.id)
                ? 'border-brand-300 ring-2 ring-brand-100 dark:ring-brand-900/50'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedProjects.includes(project.id)}
                    onChange={() => handleProjectSelect(project.id)}
                    className="w-4 h-4 text-brand-600 border-gray-300 dark:border-gray-600 rounded focus:ring-brand-500"
                  />
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
                  {project.priority}
                </div>
              </div>

              <Link href={`/projects/${project.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors line-clamp-2 cursor-pointer">
                  {project.name}
                </h3>
              </Link>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                {project.description}
              </p>
            </div>

            {/* Progress Section */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    project.progress >= 80 ? 'bg-green-500' :
                    project.progress >= 50 ? 'bg-blue-500' :
                    project.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ delay: index * 0.05 + 0.3, duration: 0.8 }}
                />
              </div>
            </div>

            {/* Project Details */}
            <div className="p-4 space-y-3">
              {/* Methodology */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 dark:text-gray-500">
                    {getMethodologyIcon(project.methodology)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {project.methodology}
                  </span>
                </div>
                {project.budget && (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(project.budget)}
                  </span>
                )}
              </div>

              {/* Dates */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Start: {formatDate(project.startDate)}</span>
                <span className={isOverdue(project.dueDate, project.status) ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                  Due: {formatDate(project.dueDate)}
                </span>
              </div>

              {/* Team Members */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Team:</span>
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
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tagObj, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg"
                    >
                      {tagObj.tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition-colors"
                >
                  View Details
                </Link>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Edit project"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="More options"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Overdue Indicator */}
            {isOverdue(project.dueDate, project.status) && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" title="Overdue"></div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}