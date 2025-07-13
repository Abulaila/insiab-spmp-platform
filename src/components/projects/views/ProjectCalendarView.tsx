'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SortConfig } from '../../../app/projects/page';
import { ProjectWithTeamMembers } from '../../../lib/database';

interface ProjectCalendarViewProps {
  projects: ProjectWithTeamMembers[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ProjectCalendarView({
  projects,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig
}: ProjectCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41); // 6 weeks

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    return days;
  }, [currentMonth, currentYear]);

  // Get projects for a specific date
  const getProjectsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return projects.filter(project => {
      const startDate = new Date(project.startDate).toDateString();
      const dueDate = new Date(project.dueDate).toDateString();
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.dueDate);
      
      return date >= projectStart && date <= projectEnd;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'month'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Week
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {DAYS.map(day => (
            <div key={day} className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === new Date().toDateString();
            const dayProjects = getProjectsForDate(date);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                }`}
              >
                <div className={`flex items-center justify-between mb-2`}>
                  <span className={`text-sm font-medium ${
                    isToday 
                      ? 'bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
                      : isCurrentMonth 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {date.getDate()}
                  </span>
                  {dayProjects.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dayProjects.length}
                    </span>
                  )}
                </div>

                {/* Project indicators */}
                <div className="space-y-1">
                  {dayProjects.slice(0, 3).map((project, idx) => {
                    const isStart = new Date(project.startDate).toDateString() === date.toDateString();
                    const isEnd = new Date(project.dueDate).toDateString() === date.toDateString();
                    
                    return (
                      <div
                        key={project.id}
                        className={`text-xs p-1 rounded truncate cursor-pointer transition-colors ${getStatusColor(project.status)} text-white`}
                        title={`${project.name} - ${project.status}`}
                        onClick={() => {
                          if (selectedProjects.includes(project.id)) {
                            setSelectedProjects(selectedProjects.filter(id => id !== project.id));
                          } else {
                            setSelectedProjects([...selectedProjects, project.id]);
                          }
                        }}
                      >
                        {isStart && '▶ '}
                        {project.name.length > 15 ? project.name.substring(0, 12) + '...' : project.name}
                        {isEnd && ' ◀'}
                      </div>
                    );
                  })}
                  {dayProjects.length > 3 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      +{dayProjects.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Blocked</span>
        </div>
      </div>
    </div>
  );
}