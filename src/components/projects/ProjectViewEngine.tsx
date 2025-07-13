'use client';

import { motion } from 'framer-motion';
import { ViewMode, SortConfig } from '../../app/projects/page';
import { ProjectWithTeamMembers } from '../../lib/database';

// Import view components
import ProjectListView from './views/ProjectListView';
import ProjectCardsView from './views/ProjectCardsView';
import ProjectGanttView from './views/ProjectGanttView';
import ProjectKanbanView from './views/ProjectKanbanView';
import ProjectCalendarView from './views/ProjectCalendarView';
import ProjectNetworkView from './views/ProjectNetworkView';

interface ProjectViewEngineProps {
  projects: ProjectWithTeamMembers[];
  viewMode: ViewMode;
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loading: boolean;
}

export default function ProjectViewEngine({
  projects,
  viewMode,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig,
  loading
}: ProjectViewEngineProps) {

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H6" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Projects Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              No projects match your current filters. Try adjusting your search criteria or create a new project to get started.
            </p>
            <motion.button 
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create New Project
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const renderView = () => {
    const commonProps = {
      projects,
      selectedProjects,
      setSelectedProjects,
      sortConfig,
      setSortConfig
    };

    switch (viewMode) {
      case 'list':
        return <ProjectListView {...commonProps} />;
      case 'cards':
        return <ProjectCardsView {...commonProps} />;
      case 'gantt':
        return <ProjectGanttView {...commonProps} />;
      case 'kanban':
        return <ProjectKanbanView {...commonProps} />;
      case 'calendar':
        return <ProjectCalendarView {...commonProps} />;
      case 'network':
        return <ProjectNetworkView {...commonProps} />;
      default:
        return <ProjectCardsView {...commonProps} />;
    }
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* View Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {viewMode} View
            </h3>
            <span className="px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium rounded-lg">
              {projects.length} project{projects.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Bulk Actions */}
          {selectedProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedProjects.length} selected
              </span>
              <button className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Edit
              </button>
              <button className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                Delete
              </button>
              <button 
                onClick={() => setSelectedProjects([])}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* View Content */}
      <div className="min-h-[500px]">
        {renderView()}
      </div>
    </motion.div>
  );
}