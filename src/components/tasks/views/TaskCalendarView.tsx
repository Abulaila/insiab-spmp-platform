'use client';

import { motion } from 'framer-motion';
import { SortConfig, TaskWithDetails } from '../../../app/tasks/page';
import { useState, useMemo } from 'react';

interface TaskCalendarViewProps {
  tasks: TaskWithDetails[];
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function TaskCalendarView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig
}: TaskCalendarViewProps) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const { calendarData, monthName, year } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long' });

    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get first day of the week for the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Get last day of the week for the last day of month
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    // Generate calendar weeks
    const weeks = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(current);
        const dateString = date.toISOString().split('T')[0];
        
        // Get tasks for this date (due date or start date)
        const dayTasks = tasks.filter(task => {
          const taskDueDate = task.dueDate ? task.dueDate.split('T')[0] : null;
          const taskStartDate = task.startDate ? task.startDate.split('T')[0] : null;
          return taskDueDate === dateString || taskStartDate === dateString;
        });

        week.push({
          date: new Date(date),
          tasks: dayTasks,
          isCurrentMonth: date.getMonth() === month,
          isToday: dateString === new Date().toISOString().split('T')[0]
        });
        
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return { calendarData: weeks, monthName, year };
  }, [currentDate, tasks]);

  const getStatusColor = (status: string) => {
    const colors = {
      not_started: 'bg-gray-200 text-gray-700',
      in_progress: 'bg-blue-200 text-blue-800',
      blocked: 'bg-red-200 text-red-800',
      completed: 'bg-green-200 text-green-800',
      cancelled: 'bg-gray-200 text-gray-600',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-200 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      urgent: 'border-l-red-500',
      high: 'border-l-orange-500',
      medium: 'border-l-yellow-500',
      low: 'border-l-green-500',
    };
    return colors[priority as keyof typeof colors] || 'border-l-gray-400';
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleTaskSelect = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    } else {
      setSelectedTasks([...selectedTasks, taskId]);
    }
  };

  const TaskItem = ({ task, isCompact = false }: { task: TaskWithDetails; isCompact?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mb-1 p-1 rounded border-l-2 ${getPriorityColor(task.priority)} ${getStatusColor(task.status)} cursor-pointer hover:shadow-sm transition-all ${
        selectedTasks.includes(task.id) ? 'ring-1 ring-brand-500' : ''
      } ${isOverdue(task.dueDate, task.status) ? 'bg-red-100 border-red-500' : ''}`}
      onClick={() => handleTaskSelect(task.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium truncate`}>
            {task.title}
          </p>
          {!isCompact && task.assignee && (
            <p className="text-xs text-gray-600 truncate">
              {task.assignee.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {task.progress === 100 && (
            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isOverdue(task.dueDate, task.status) && (
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
      </div>
      {!isCompact && (
        <div className="flex items-center justify-between mt-1">
          <div className="w-12 bg-gray-300 rounded-full h-1">
            <div
              className="bg-gradient-to-r from-brand-500 to-brand-600 h-1 rounded-full"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{task.progress}%</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthName} {year}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg hover:bg-brand-200 dark:hover:bg-brand-900/50 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'month'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              viewMode === 'week'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarData.map((week, weekIndex) =>
            week.map((day, dayIndex) => (
              <motion.div
                key={`${weekIndex}-${dayIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                  !day.isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''
                } ${day.isToday ? 'bg-brand-50/50 dark:bg-brand-900/20' : ''}`}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    !day.isCurrentMonth 
                      ? 'text-gray-400 dark:text-gray-600' 
                      : day.isToday 
                        ? 'text-brand-600 dark:text-brand-400 font-bold' 
                        : 'text-gray-900 dark:text-white'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {day.tasks.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{day.tasks.length - 3}
                    </span>
                  )}
                </div>

                {/* Tasks */}
                <div className="space-y-1">
                  {day.tasks.slice(0, 3).map((task) => (
                    <TaskItem key={task.id} task={task} isCompact={true} />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border-l-2 border-l-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border-l-2 border-l-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border-l-2 border-l-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border-l-2 border-l-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Overdue</span>
          </div>
        </div>
      </div>

      {/* Task Details Sidebar for selected tasks */}
      {selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-6 top-1/2 transform -translate-y-1/2 w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-white/30 dark:border-gray-700/30 shadow-lg p-4 max-h-[70vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Selected Tasks ({selectedTasks.length})
            </h3>
            <button
              onClick={() => setSelectedTasks([])}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {tasks
              .filter(task => selectedTasks.includes(task.id))
              .map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}