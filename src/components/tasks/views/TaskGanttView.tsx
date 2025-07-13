'use client';

import { motion } from 'framer-motion';
import { SortConfig, TaskWithDetails } from '../../../app/tasks/page';
import { useMemo } from 'react';

interface TaskGanttViewProps {
  tasks: TaskWithDetails[];
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function TaskGanttView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig
}: TaskGanttViewProps) {

  const { timeScale, tasksWithPositions } = useMemo(() => {
    if (tasks.length === 0) {
      return { timeScale: [], tasksWithPositions: [] };
    }

    // Find the earliest start date and latest due date
    const dates = tasks
      .flatMap(task => [task.startDate, task.dueDate])
      .filter(date => date !== null)
      .map(date => new Date(date!));

    if (dates.length === 0) {
      return { timeScale: [], tasksWithPositions: [] };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Add some padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    // Generate time scale (weeks)
    const timeScale = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      timeScale.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    // Calculate task positions
    const totalDuration = maxDate.getTime() - minDate.getTime();
    const tasksWithPositions = tasks.map(task => {
      let startPos = 0;
      let width = 100; // Default width if no dates

      if (task.startDate && task.dueDate) {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.dueDate);
        startPos = ((taskStart.getTime() - minDate.getTime()) / totalDuration) * 100;
        width = ((taskEnd.getTime() - taskStart.getTime()) / totalDuration) * 100;
      } else if (task.startDate) {
        const taskStart = new Date(task.startDate);
        startPos = ((taskStart.getTime() - minDate.getTime()) / totalDuration) * 100;
        width = 20; // Default width for tasks with only start date
      } else if (task.dueDate) {
        const taskEnd = new Date(task.dueDate);
        startPos = ((taskEnd.getTime() - minDate.getTime()) / totalDuration) * 100 - 20;
        width = 20; // Default width for tasks with only due date
      }

      return {
        ...task,
        startPos: Math.max(0, startPos),
        width: Math.min(width, 100 - startPos)
      };
    });

    return { timeScale, tasksWithPositions };
  }, [tasks]);

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-400',
      in_progress: 'bg-blue-500',
      blocked: 'bg-red-500',
      completed: 'bg-green-500',
      cancelled: 'bg-gray-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-red-600',
      high: 'border-orange-500',
      medium: 'border-yellow-500',
      low: 'border-green-500',
    };
    return colors[priority as keyof typeof colors] || 'border-gray-400';
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
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

  if (tasksWithPositions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No tasks with dates available for Gantt view</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto">
      <div className="min-w-[800px]">
        {/* Timeline Header */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div className="w-80 flex-shrink-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Tasks</h3>
          </div>
          <div className="flex-1 relative">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              {timeScale.map((date, index) => (
                <div key={index} className="text-center">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
            {/* Vertical grid lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {timeScale.map((_, index) => (
                <div key={index} className="w-px bg-gray-200 dark:bg-gray-700 h-full opacity-50" />
              ))}
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasksWithPositions.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors ${
                selectedTasks.includes(task.id) ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''
              } ${isOverdue(task.dueDate, task.status) ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
            >
              {/* Task Info */}
              <div className="w-80 flex-shrink-0 p-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => handleTaskSelect(task.id)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </h4>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      {/* Assignee */}
                      <div className="flex items-center space-x-1">
                        {task.assignee ? (
                          <>
                            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              {task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="w-4 h-4 rounded-full"
                                />
                              ) : (
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">Unassigned</span>
                        )}
                      </div>

                      {/* Progress */}
                      <div className="flex items-center space-x-1">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-gradient-to-r from-brand-500 to-brand-600 h-1 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{task.progress}%</span>
                      </div>

                      {/* Dependencies indicator */}
                      {task.dependencies.length > 0 && (
                        <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <span className="text-xs">{task.dependencies.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Gantt Bar */}
              <div className="flex-1 relative h-12 px-3">
                <div
                  className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded-lg border-2 ${getStatusColor(task.status)} ${getPriorityColor(task.priority)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                  style={{
                    left: `${task.startPos}%`,
                    width: `${Math.max(task.width, 2)}%`
                  }}
                  title={`${task.title} - ${formatDate(task.startDate)} to ${formatDate(task.dueDate)}`}
                >
                  {/* Progress overlay */}
                  <div
                    className="h-full bg-white/30 rounded-lg"
                    style={{ width: `${task.progress}%` }}
                  />
                  
                  {/* Task label */}
                  {task.width > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm truncate px-1">
                        {task.title}
                      </span>
                    </div>
                  )}

                  {/* Overdue indicator */}
                  {isOverdue(task.dueDate, task.status) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white">
                      <span className="sr-only">Overdue</span>
                    </div>
                  )}
                </div>

                {/* Dependencies lines */}
                {task.dependencies.map((dep, depIndex) => {
                  const blockingTask = tasksWithPositions.find(t => t.id === dep.blockingTask.id);
                  if (!blockingTask) return null;

                  const startX = blockingTask.startPos + blockingTask.width;
                  const endX = task.startPos;
                  
                  return (
                    <svg
                      key={depIndex}
                      className="absolute inset-0 pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      <defs>
                        <marker
                          id={`arrowhead-${task.id}-${depIndex}`}
                          markerWidth="10"
                          markerHeight="7"
                          refX="9"
                          refY="3.5"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill="#9CA3AF"
                          />
                        </marker>
                      </defs>
                      <line
                        x1={`${startX}%`}
                        y1="50%"
                        x2={`${endX}%`}
                        y2="50%"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        strokeDasharray="3,3"
                        markerEnd={`url(#arrowhead-${task.id}-${depIndex})`}
                      />
                    </svg>
                  );
                })}
              </div>

              {/* Duration */}
              <div className="w-20 flex-shrink-0 p-3 text-right">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {task.startDate && task.dueDate ? (
                    <span>
                      {Math.ceil((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24))}d
                    </span>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-gray-400 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Not Started</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Blocked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600 dark:text-gray-400">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <line x1="0" y1="12" x2="24" y2="12" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="3,3" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Dependencies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}