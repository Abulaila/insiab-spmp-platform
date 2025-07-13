'use client';

import { motion } from 'framer-motion';
import { SortConfig, TaskWithDetails } from '../../../app/tasks/page';
import Link from 'next/link';

interface TaskKanbanViewProps {
  tasks: TaskWithDetails[];
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function TaskKanbanView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig
}: TaskKanbanViewProps) {

  const columns = [
    { id: 'not_started', title: 'Not Started', color: 'bg-gray-100 text-gray-800' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100 text-red-800' },
    { id: 'completed', title: 'Completed', color: 'bg-green-100 text-green-800' }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-l-red-600 bg-red-50/50',
      high: 'border-l-orange-500 bg-orange-50/50',
      medium: 'border-l-yellow-500 bg-yellow-50/50',
      low: 'border-l-green-500 bg-green-50/50',
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-400 bg-gray-50/50';
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
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

  const TaskCard = ({ task, index }: { task: TaskWithDetails; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 p-3 mb-3 cursor-pointer ${
        getPriorityColor(task.priority)
      } ${selectedTasks.includes(task.id) ? 'ring-2 ring-brand-500 ring-opacity-50' : ''} ${
        isOverdue(task.dueDate, task.status) ? 'bg-red-50/70 dark:bg-red-900/20' : ''
      }`}
      onClick={() => handleTaskSelect(task.id)}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Link
            href={`/tasks/${task.id}`}
            className="block group"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
              {task.title}
            </h4>
          </Link>
        </div>
        <input
          type="checkbox"
          checked={selectedTasks.includes(task.id)}
          onChange={() => handleTaskSelect(task.id)}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-xs font-medium text-gray-900 dark:text-white">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-brand-500 to-brand-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300"
            >
              {tag.tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Assignee */}
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
              <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                {task.assignee.name}
              </span>
            </>
          ) : (
            <span className="text-xs text-gray-500 dark:text-gray-400">Unassigned</span>
          )}
        </div>

        {/* Priority Badge */}
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {task.priority.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3" />
              </svg>
              <span>{task.subtasks.length}</span>
            </div>
          )}

          {/* Comments */}
          {task.comments.length > 0 && (
            <div className="flex items-center space-x-1">
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

      {/* Project */}
      {task.project && (
        <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <Link
            href={`/projects/${task.project.id}`}
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            📁 {task.project.name}
          </Link>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="p-6 overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div key={column.id} className="flex-shrink-0 w-80">
              {/* Column Header */}
              <div className={`rounded-lg p-3 mb-4 ${column.color} backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <span className="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full text-xs font-medium">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="space-y-0 min-h-[400px]">
                {columnTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task, index) => (
                    <TaskCard key={task.id} task={task} index={index} />
                  ))
                )}
              </div>

              {/* Add Task Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors text-sm font-medium"
              >
                + Add Task
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}