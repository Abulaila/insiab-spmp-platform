'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Import view components
import QuickChartsSection from '../../components/tasks/QuickChartsSection';
import FilterSortSection from '../../components/tasks/FilterSortSection';
import TaskViewEngine from '../../components/tasks/TaskViewEngine';

// Import collaboration components - TEMPORARILY DISABLED FOR PERFORMANCE
// import PresenceIndicators from '../../components/collaboration/PresenceIndicators';
// import RealTimeActivityFeed from '../../components/collaboration/RealTimeActivityFeed';
// import { useRealTimeCollaboration } from '../../hooks/useRealTimeCollaboration';

// Task type based on our Prisma schema
export interface TaskWithDetails {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  startDate: string | null;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number;
  completedAt: string | null;
  projectId: string | null;
  assigneeId: string | null;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  parentTaskId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  };
  project: {
    id: string;
    name: string;
    status: string;
  } | null;
  tags: {
    id: string;
    tag: string;
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    creator: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }[];
  subtasks: {
    id: string;
    title: string;
    status: string;
    progress: number;
  }[];
  parentTask: {
    id: string;
    title: string;
  } | null;
  dependencies: {
    blockingTask: {
      id: string;
      title: string;
      status: string;
    };
  }[];
  dependentTasks: {
    dependentTask: {
      id: string;
      title: string;
      status: string;
    };
  }[];
}

// Types for filtering and sorting
export interface TaskFilters {
  search: string;
  status: string[];
  priority: string[];
  assignee: string[];
  project: string[];
  dateRange: { start: Date | null; end: Date | null };
  progressRange: { min: number; max: number };
  estimatedHoursRange: { min: number; max: number };
  tags: string[];
  hasSubtasks: boolean | null;
  isOverdue: boolean | null;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export type ViewMode = 'list' | 'cards' | 'gantt' | 'kanban' | 'calendar' | 'timeline';

export default function TasksPage() {
  // Core state
  const [tasks, setTasks] = useState<TaskWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: [],
    priority: [],
    assignee: [],
    project: [],
    dateRange: { start: null, end: null },
    progressRange: { min: 0, max: 100 },
    estimatedHoursRange: { min: 0, max: 200 },
    tags: [],
    hasSubtasks: null,
    isOverdue: null
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'title',
    direction: 'asc'
  });

  // UI state
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showActivityFeed, setShowActivityFeed] = useState(false);

  // Real-time collaboration
  // TEMPORARILY DISABLED FOR PERFORMANCE - WebSocket causing infinite loading
  // const { 
  //   currentViewers, 
  //   sendEdit, 
  //   announcePresence, 
  //   announceLeave 
  // } = useRealTimeCollaboration({
  //   entityType: 'task',
  //   entityId: 'tasks-page',
  //   userId: 'current-user-id',
  //   userName: 'Current User',
  //   userAvatar: undefined,
  //   enableCursorTracking: true
  // });

  // Load tasks data
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tasks: ${response.statusText}`);
        }
        
        const tasksData = await response.json();
        setTasks(tasksData);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // TEMPORARILY DISABLED FOR PERFORMANCE - WebSocket presence announcements
    // announcePresence();
    
    // Return cleanup function (no WebSocket cleanup needed for now)
    return () => {
      // announceLeave();
    };
  }, []);

  // Filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          task.title,
          task.description,
          ...task.tags.map(t => t.tag),
          task.assignee?.name || '',
          task.project?.name || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0 && (!task.assignee || !filters.assignee.includes(task.assignee.id))) {
        return false;
      }

      // Project filter
      if (filters.project.length > 0 && (!task.project || !filters.project.includes(task.project.id))) {
        return false;
      }

      // Progress filter
      if (task.progress < filters.progressRange.min || task.progress > filters.progressRange.max) {
        return false;
      }

      // Estimated hours filter
      if (task.estimatedHours && (task.estimatedHours < filters.estimatedHoursRange.min || task.estimatedHours > filters.estimatedHoursRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const taskDate = task.dueDate ? new Date(task.dueDate) : null;
        if (!taskDate) return false;
        
        if (filters.dateRange.start && taskDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && taskDate > filters.dateRange.end) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const taskTags = task.tags.map(t => t.tag);
        const hasMatchingTag = filters.tags.some(tag => taskTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Subtasks filter
      if (filters.hasSubtasks !== null) {
        const hasSubtasks = task.subtasks.length > 0;
        if (filters.hasSubtasks !== hasSubtasks) {
          return false;
        }
      }

      // Overdue filter
      if (filters.isOverdue !== null) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        if (filters.isOverdue !== !!isOverdue) {
          return false;
        }
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof typeof a];
      let bValue: any = b[sortConfig.field as keyof typeof b];

      // Handle special fields
      if (sortConfig.field === 'assigneeName') {
        aValue = a.assignee?.name || '';
        bValue = b.assignee?.name || '';
      } else if (sortConfig.field === 'projectName') {
        aValue = a.project?.name || '';
        bValue = b.project?.name || '';
      } else if (sortConfig.field === 'dueDate' || sortConfig.field === 'startDate') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Convert to string for comparison if needed
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });

    return filtered;
  }, [tasks, filters, sortConfig]);

  // Calculate analytics data for charts
  const analyticsData = useMemo(() => {
    const statusCounts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const assigneeCounts = tasks.reduce((acc, task) => {
      const assigneeName = task.assignee?.name || 'Unassigned';
      acc[assigneeName] = (acc[assigneeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const projectCounts = tasks.reduce((acc, task) => {
      const projectName = task.project?.name || 'No Project';
      acc[projectName] = (acc[projectName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageProgress = tasks.length > 0 ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length : 0;

    const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const totalActualHours = tasks.reduce((sum, task) => sum + task.actualHours, 0);

    // Overdue tasks
    const now = new Date();
    const overdueCount = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed'
    ).length;

    const completedCount = tasks.filter(task => task.status === 'completed').length;

    // Progress distribution
    const progressDistribution = {
      'Not Started': tasks.filter(t => t.progress === 0).length,
      'In Progress': tasks.filter(t => t.progress > 0 && t.progress < 100).length,
      'Completed': tasks.filter(t => t.progress === 100).length,
    };

    const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    // Average completion time (mock calculation)
    const averageCompletionTime = 5; // days

    return {
      statusCounts,
      priorityCounts,
      assigneeCounts,
      projectCounts,
      averageProgress: Math.round(averageProgress),
      totalEstimatedHours,
      totalActualHours,
      overdueCount,
      completedCount,
      progressDistribution,
      totalTasks: tasks.length,
      activeTasks: statusCounts.in_progress || 0,
      completionRate,
      averageCompletionTime
    };
  }, [tasks]);

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Tasks" subtitle="Loading your tasks...">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="Tasks" subtitle="Error loading tasks">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Tasks</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="Tasks" 
      subtitle={`${filteredAndSortedTasks.length} of ${tasks.length} tasks`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Collaboration Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* TEMPORARILY DISABLED FOR PERFORMANCE */}
            {/* <PresenceIndicators 
              entityId="tasks-page"
              maxVisible={5}
              showCursors={true}
              className="flex-shrink-0"
            /> */}
          </div>
          
          <button
            onClick={() => setShowActivityFeed(!showActivityFeed)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 15H4l5-5v5z" />
            </svg>
            <span>{showActivityFeed ? 'Hide' : 'Show'} Activity</span>
          </button>
        </div>

        <div className={`grid ${showActivityFeed ? 'grid-cols-1 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
          
          {/* Main Content */}
          <div className={`space-y-6 ${showActivityFeed ? 'xl:col-span-3' : ''}`}>
            
            {/* Section 1: Quick Charts Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <QuickChartsSection analyticsData={analyticsData} />
            </motion.div>

            {/* Section 2: Advanced Search/Filter/Sort Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <FilterSortSection
                filters={filters}
                setFilters={setFilters}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedTasks={selectedTasks}
                setSelectedTasks={setSelectedTasks}
                tasks={tasks}
                filteredCount={filteredAndSortedTasks.length}
              />
            </motion.div>

            {/* Section 3: Dynamic View Engine */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="min-h-[600px]"
            >
              <TaskViewEngine
                tasks={filteredAndSortedTasks}
                viewMode={viewMode}
                selectedTasks={selectedTasks}
                setSelectedTasks={setSelectedTasks}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                loading={loading}
              />
            </motion.div>
          </div>

          {/* Activity Feed Sidebar */}
          {showActivityFeed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="xl:col-span-1"
            >
              <div className="sticky top-6">
                {/* TEMPORARILY DISABLED FOR PERFORMANCE */}
                {/* <RealTimeActivityFeed
                  entityId="tasks-page"
                  maxItems={20}
                  showTimestamps={true}
                  className="h-[calc(100vh-8rem)] overflow-hidden"
                /> */}
                <div className="h-[calc(100vh-8rem)] overflow-hidden bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Activity feed temporarily disabled</p>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}