'use client';

import { motion } from 'framer-motion';
import { SortConfig, TaskWithDetails } from '../../../app/tasks/page';
import { useState, useMemo } from 'react';

interface TaskTimelineViewProps {
  tasks: TaskWithDetails[];
  selectedTasks: string[];
  setSelectedTasks: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

export default function TaskTimelineView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  sortConfig,
  setSortConfig
}: TaskTimelineViewProps) {

  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { timelineData, timeLabels } = useMemo(() => {
    const now = new Date();
    const tasksWithDates = tasks.filter(task => task.startDate || task.dueDate || task.createdAt);

    if (tasksWithDates.length === 0) {
      return { timelineData: [], timeLabels: [] };
    }

    // Sort tasks by creation date, then by start date, then by due date
    const sortedTasks = [...tasksWithDates].sort((a, b) => {
      const aDate = new Date(a.startDate || a.createdAt);
      const bDate = new Date(b.startDate || b.createdAt);
      return aDate.getTime() - bDate.getTime();
    });

    // Generate time labels based on range
    const timeLabels = [];
    let startTime, endTime, interval;

    switch (timeRange) {
      case 'week':
        startTime = new Date(currentDate);
        startTime.setDate(currentDate.getDate() - currentDate.getDay()); // Start of week
        endTime = new Date(startTime);
        endTime.setDate(startTime.getDate() + 6); // End of week
        interval = 1; // 1 day
        for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + interval)) {
          timeLabels.push(new Date(d));
        }
        break;

      case 'month':
        startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endTime = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        interval = 7; // 1 week
        for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + interval)) {
          timeLabels.push(new Date(d));
        }
        break;

      case 'quarter':
        const quarter = Math.floor(currentDate.getMonth() / 3);
        startTime = new Date(currentDate.getFullYear(), quarter * 3, 1);
        endTime = new Date(currentDate.getFullYear(), quarter * 3 + 3, 0);
        interval = 30; // ~1 month
        for (let d = new Date(startTime); d <= endTime; d.setDate(d.getDate() + interval)) {
          timeLabels.push(new Date(d));
        }
        break;
    }

    // Group tasks by project and status
    const groupedTasks = sortedTasks.reduce((acc, task) => {
      const key = task.project?.name || 'No Project';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {} as Record<string, TaskWithDetails[]>);

    return { timelineData: groupedTasks, timeLabels };
  }, [tasks, timeRange, currentDate]);

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

  const getPriorityBorder = (priority: string) => {
    const colors = {
      urgent: 'border-red-600',
      high: 'border-orange-500',
      medium: 'border-yellow-500',
      low: 'border-green-500',
    };
    return colors[priority as keyof typeof colors] || 'border-gray-400';
  };

  const formatDate = (date: Date) => {
    switch (timeRange) {
      case 'week':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'quarter':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getTaskPosition = (task: TaskWithDetails) => {
    const taskDate = new Date(task.startDate || task.createdAt);
    const currentTime = Date.now();
    const taskTime = taskDate.getTime();
    
    if (timeLabels.length === 0) return 0;
    
    const startTime = timeLabels[0].getTime();
    const endTime = timeLabels[timeLabels.length - 1].getTime();
    const totalDuration = endTime - startTime;
    
    if (totalDuration === 0) return 0;
    
    const position = ((taskTime - startTime) / totalDuration) * 100;
    return Math.max(0, Math.min(100, position));
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

  const navigateTime = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (timeRange) {
        case 'week':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'quarter':
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 3 : -3));
          break;
      }
      return newDate;
    });
  };

  const TimelineTask = ({ task, index }: { task: TaskWithDetails; index: number }) => {
    const position = getTaskPosition(task);
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`absolute flex items-center cursor-pointer group ${
          selectedTasks.includes(task.id) ? 'z-10' : ''
        }`}
        style={{ left: `${position}%`, top: `${(index % 3) * 25}px` }}
        onClick={() => handleTaskSelect(task.id)}
      >
        {/* Timeline dot */}
        <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(task.status)} ${getPriorityBorder(task.priority)} ${
          selectedTasks.includes(task.id) ? 'ring-2 ring-brand-500 ring-opacity-50' : ''
        } ${isOverdue(task.dueDate, task.status) ? 'ring-2 ring-red-500' : ''}`}>
          {task.status === 'completed' && (
            <svg className="w-2 h-2 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Task label */}
        <div className={`ml-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-white/30 dark:border-gray-700/30 shadow-sm min-w-0 opacity-0 group-hover:opacity-100 transition-opacity ${
          selectedTasks.includes(task.id) ? 'opacity-100' : ''
        }`}>
          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={() => handleTaskSelect(task.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {task.title}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  task.status === 'not_started' ? 'bg-gray-100 text-gray-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'blocked' ? 'bg-red-100 text-red-700' :
                  task.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              {task.assignee && (
                <div className="flex items-center space-x-1 mt-1">
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
                  <span className="text-xs text-gray-600 dark:text-gray-400">{task.assignee.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-brand-600 h-1 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">{task.progress}%</span>
              </div>
              {task.dueDate && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="text-red-600 dark:text-red-400 ml-1">(Overdue)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  if (Object.keys(timelineData).length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No tasks with dates available for timeline view</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Task Timeline
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateTime('prev')}
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
              onClick={() => navigateTime('next')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(['week', 'month', 'quarter'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors capitalize ${
                timeRange === range
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/30 p-6 overflow-x-auto">
        {/* Time scale */}
        <div className="flex justify-between items-center mb-8 min-w-[800px]">
          {timeLabels.map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(date)}
              </div>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-auto mt-2"></div>
            </div>
          ))}
        </div>

        {/* Project groups */}
        <div className="space-y-8 min-w-[800px]">
          {Object.entries(timelineData).map(([projectName, projectTasks]) => (
            <motion.div
              key={projectName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Project header */}
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {projectName}
                </h3>
                <span className="inline-flex items-center px-2 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm rounded-lg">
                  {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Timeline line */}
              <div className="relative h-20 border-b border-gray-200 dark:border-gray-700">
                <div className="absolute inset-x-0 top-10 h-px bg-gray-300 dark:bg-gray-600"></div>
                
                {/* Time markers */}
                <div className="absolute inset-0 flex justify-between">
                  {timeLabels.map((_, index) => (
                    <div key={index} className="w-px h-full bg-gray-200 dark:border-gray-700 opacity-30"></div>
                  ))}
                </div>

                {/* Tasks */}
                {projectTasks.map((task, index) => (
                  <TimelineTask key={task.id} task={task} index={index} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-red-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Blocked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full ring-2 ring-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
}