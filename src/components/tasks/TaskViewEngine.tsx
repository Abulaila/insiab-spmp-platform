'use client';

import { motion } from 'framer-motion';
import { ViewMode, SortConfig, TaskWithDetails } from '../../app/tasks/page';

// Import view components
import TaskListView from './views/TaskListView';
import TaskCardsView from './views/TaskCardsView';
import TaskGanttView from './views/TaskGanttView';
import TaskKanbanView from './views/TaskKanbanView';
import TaskCalendarView from './views/TaskCalendarView';
import TaskTimelineView from './views/TaskTimelineView';

interface TaskViewEngineProps {
  tasks: TaskWithDetails[];
  viewMode: ViewMode;
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  loading: boolean;
  setViewMode: (mode: ViewMode) => void;
}

export default function TaskViewEngine({
  tasks,
  viewMode,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig,
  loading,
  setViewMode
}: TaskViewEngineProps) {

  if (loading) {
    return (
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <motion.div 
        className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center py-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-24 h-24 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Tasks Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              No tasks match your current filters. Try adjusting your search criteria or create a new task to get started.
            </p>
            <motion.button 
              className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create New Task
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const renderView = () => {
    const commonProps = {
      tasks,
      selectedTasks,
      setSelectedTasks,
      sortConfig,
      setSortConfig
    };

    switch (viewMode) {
      case 'list':
        return <TaskListView {...commonProps} />;
      case 'cards':
        return <TaskCardsView {...commonProps} />;
      case 'gantt':
        return <TaskGanttView {...commonProps} />;
      case 'kanban':
        return <TaskKanbanView {...commonProps} />;
      case 'calendar':
        return <TaskCalendarView {...commonProps} />;
      case 'timeline':
        return <TaskTimelineView {...commonProps} />;
      default:
        return <TaskCardsView {...commonProps} />;
    }
  };

  return (
    <motion.div
      className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* View Header */}
      <div className="px-6 py-4 border-b border-white/20 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {viewMode} View
            </h3>
            <span className="px-3 py-1 bg-brand-100/70 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-sm font-medium rounded-lg backdrop-blur-sm">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Bulk Actions */}
          {selectedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedTasks.length} selected
              </span>
              <button className="px-3 py-1 bg-gray-100/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200/70 dark:hover:bg-gray-600/70 transition-colors backdrop-blur-sm">
                Assign
              </button>
              <button className="px-3 py-1 bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200/70 dark:hover:bg-blue-900/60 transition-colors backdrop-blur-sm">
                Complete
              </button>
              <button className="px-3 py-1 bg-red-100/70 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg text-sm hover:bg-red-200/70 dark:hover:bg-red-900/60 transition-colors backdrop-blur-sm">
                Delete
              </button>
              <button 
                onClick={() => setSelectedTasks([])}
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