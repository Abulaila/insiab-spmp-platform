'use client';

import { motion } from 'framer-motion';
import { SortConfig, TaskWithDetails } from '../../../app/tasks/page';
import Link from 'next/link';

interface TaskCardsViewProps {
  tasks: TaskWithDetails[];
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function TaskCardsView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig
}: TaskCardsViewProps) {

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800 border-gray-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      blocked: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'text-red-700 bg-red-100 border-red-300',
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      not_started: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      in_progress: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      blocked: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
      ),
      completed: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      cancelled: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    };
    return icons[status as keyof typeof icons] || null;
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatHours = (hours: number | null) => {
    if (!hours) return null;
    return `${hours}h`;
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskSelect = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const getTimeTrackingDisplay = (task: TaskWithDetails) => {
    const estimated = task.estimatedHours || 0;
    const actual = task.actualHours || 0;
    
    if (estimated === 0 && actual === 0) return null;
    
    const isOvertime = actual > estimated && estimated > 0;
    
    return (
      <div className="flex items-center space-x-2 text-xs">
        <div className="flex items-center space-x-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">
            {actual}h
          </span>
          {estimated > 0 && (
            <>
              <span className="text-gray-400">/</span>
              <span className={`${isOvertime ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                {estimated}h
              </span>
            </>
          )}
        </div>
        {isOvertime && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            Over
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
              selectedTasks.includes(task.id) ? 'ring-2 ring-brand-500 ring-opacity-50' : ''
            } ${isOverdue(task.dueDate, task.status) ? 'border-red-300 dark:border-red-700 bg-red-50/30 dark:bg-red-900/10' : ''}`}
          >
            {/* Card Header */}
            <div className="p-4 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleTaskSelect(task.id)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                      <span className="mr-1">{getStatusIcon(task.status)}</span>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>

              {/* Task Title */}
              <Link
                href={`/tasks/${task.id}`}
                className="block group"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 mb-2">
                  {task.title}
                </h3>
              </Link>

              {/* Description */}
              {task.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {task.description}
                </p>
              )}

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {task.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-white/20 dark:border-gray-700/30">
              {/* Assignee and Project */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {task.assignee ? (
                    <>
                      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {task.assignee.avatar ? (
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                        {task.assignee.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Unassigned</span>
                  )}
                </div>

                {task.project && (
                  <Link
                    href={`/projects/${task.project.id}`}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors truncate max-w-[80px]"
                  >
                    {task.project.name}
                  </Link>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {/* Subtasks */}
                  {task.subtasks.length > 0 && (
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3" />
                      </svg>
                      <span>{task.subtasks.length}</span>
                    </div>
                  )}

                  {/* Comments */}
                  {task.comments.length > 0 && (
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{task.comments.length}</span>
                    </div>
                  )}

                  {/* Dependencies */}
                  {task.dependencies.length > 0 && (
                    <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>{task.dependencies.length}</span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <span className={`${
                    isOverdue(task.dueDate, task.status)
                      ? 'text-red-600 dark:text-red-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>

              {/* Time Tracking */}
              {getTimeTrackingDisplay(task) && (
                <div className="mt-2 pt-2 border-t border-white/20 dark:border-gray-700/30">
                  {getTimeTrackingDisplay(task)}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center space-x-1">
                <button className="p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                  <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button className="p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-md hover:bg-white dark:hover:bg-gray-800 transition-colors">
                  <svg className="w-3 h-3 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}