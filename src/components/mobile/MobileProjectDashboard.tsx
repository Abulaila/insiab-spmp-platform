'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { offlineManager } from '../../lib/mobile/offline-manager';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  progress: number;
  startDate: string;
  endDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  team: TeamMember[];
  tasks: Task[];
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  health: 'green' | 'yellow' | 'red';
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate: string;
  progress: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  status: 'available' | 'busy' | 'offline';
}

interface MobileProjectDashboardProps {
  className?: string;
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
};

const HEALTH_COLORS = {
  green: 'text-green-500',
  yellow: 'text-yellow-500',
  red: 'text-red-500'
};

export default function MobileProjectDashboard({ className = '' }: MobileProjectDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'status' | 'progress'>('priority');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    loadProjects();
    setupOfflineSupport();
  }, []);

  const loadProjects = async () => {
    try {
      // Try to load from server first
      if (navigator.onLine) {
        const response = await fetch('/api/v1/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
          // Store offline for future use
          await offlineManager.storeOffline('project', 'all', data);
        } else {
          // Fallback to offline data
          const offlineData = await offlineManager.retrieveOffline('project', 'all');
          if (offlineData) {
            setProjects(offlineData);
          }
        }
      } else {
        // Load from offline storage
        const offlineData = await offlineManager.retrieveOffline('project', 'all');
        if (offlineData) {
          setProjects(offlineData);
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Fallback to offline data
      const offlineData = await offlineManager.retrieveOffline('project', 'all');
      if (offlineData) {
        setProjects(offlineData);
      }
    }
  };

  const setupOfflineSupport = () => {
    // Monitor network status
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // Listen to offline manager events
    offlineManager.on('syncStarted', () => setSyncStatus('syncing'));
    offlineManager.on('syncCompleted', () => setSyncStatus('idle'));
    offlineManager.on('syncError', () => setSyncStatus('error'));

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  };

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'progress':
          return b.progress - a.progress;
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, filterStatus, searchQuery, sortBy]);

  const handleProjectUpdate = async (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    );
    setProjects(updatedProjects);

    // Store offline and add to sync queue
    await offlineManager.storeOffline('project', 'all', updatedProjects);
    offlineManager.addToSyncQueue('update', 'projects', { id: projectId, ...updates });
  };

  const handleSwipeAction = (project: Project, direction: 'left' | 'right') => {
    if (direction === 'left') {
      // Quick complete action
      handleProjectUpdate(project.id, { status: 'completed', progress: 100 });
    } else {
      // Quick edit action
      setSelectedProject(project);
    }
  };

  const getProjectStats = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const onHold = projects.filter(p => p.status === 'on_hold').length;

    return { total, active, completed, onHold };
  };

  const stats = getProjectStats();

  const ProjectCard = ({ project }: { project: Project }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (event: any, info: PanInfo) => {
      setIsDragging(false);
      const threshold = 100;
      
      if (Math.abs(info.offset.x) > threshold) {
        const direction = info.offset.x > 0 ? 'right' : 'left';
        handleSwipeAction(project, direction);
      }
    };

    return (
      <motion.div
        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 ${isDragging ? 'z-10' : ''}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05, rotate: isDragging ? 2 : 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        {/* Swipe Actions Background */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 bg-green-500 rounded-l-xl flex items-center justify-center text-white font-medium">
            <span className="text-sm">✓ Complete</span>
          </div>
          <div className="w-1/2 bg-blue-500 rounded-r-xl flex items-center justify-center text-white font-medium">
            <span className="text-sm">✏️ Edit</span>
          </div>
        </div>

        {/* Card Content */}
        <div className="relative bg-white rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${HEALTH_COLORS[project.health]}`} />
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
              {project.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
              {project.priority}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Team Avatars */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {project.team.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {project.team.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                  +{project.team.length - 3}
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-500">Due</div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(project.endDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Tasks Summary */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {project.tasks.filter(t => t.status === 'completed').length}/{project.tasks.length} tasks
              </span>
              <span className="text-gray-600">
                {project.budget.currency} {(project.budget.spent / 1000).toFixed(0)}k / {(project.budget.allocated / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Status Bar */}
      {isOffline && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          📱 Offline Mode - Changes will sync when connected
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <div className="flex items-center space-x-2">
              {syncStatus === 'syncing' && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-500">Total</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-green-500">Active</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600">{stats.completed}</div>
              <div className="text-xs text-purple-500">Done</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.onHold}</div>
              <div className="text-xs text-yellow-500">Hold</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex space-x-3 overflow-x-auto pb-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="priority">Sort by Priority</option>
                <option value="name">Sort by Name</option>
                <option value="status">Sort by Status</option>
                <option value="progress">Sort by Progress</option>
              </select>

              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {['grid', 'list', 'kanban'].map((viewType) => (
                  <button
                    key={viewType}
                    onClick={() => setView(viewType as any)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      view === viewType
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {viewType === 'grid' ? '⊞' : viewType === 'list' ? '☰' : '📋'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="p-4">
        <motion.div
          className={`${view === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-4'}`}
          layout
        >
          <AnimatePresence>
            {filteredAndSortedProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredAndSortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Create your first project to get started'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
            onClick={() => setShowQuickActions(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full bg-white rounded-t-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl text-blue-600">
                  <span className="text-2xl">📝</span>
                  <span className="font-medium">New Project</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl text-green-600">
                  <span className="text-2xl">📊</span>
                  <span className="font-medium">Analytics</span>
                </button>
                <button 
                  onClick={() => offlineManager.forcSync()}
                  className="flex items-center space-x-3 p-4 bg-purple-50 rounded-xl text-purple-600"
                >
                  <span className="text-2xl">🔄</span>
                  <span className="font-medium">Sync Now</span>
                </button>
                <button className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl text-orange-600">
                  <span className="text-2xl">⚙️</span>
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pull to Refresh Indicator */}
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30">
        {syncStatus === 'syncing' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Syncing...</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}