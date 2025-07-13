'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { ProjectWithTeamMembers } from '../../lib/database';
import { motion, AnimatePresence } from 'framer-motion';

// Import view components
import QuickChartsSection from '../../components/projects/QuickChartsSection';
import FilterSortSection from '../../components/projects/FilterSortSection';
import ProjectViewEngine from '../../components/projects/ProjectViewEngine';

// Types for filtering and sorting
export interface ProjectFilters {
  search: string;
  status: string[];
  methodology: string[];
  priority: string[];
  dateRange: { start: Date | null; end: Date | null };
  progressRange: { min: number; max: number };
  budgetRange: { min: number; max: number };
  tags: string[];
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export type ViewMode = 'list' | 'cards' | 'gantt' | 'kanban' | 'calendar' | 'network';

export default function ProjectsPage() {
  // Core state
  const [projects, setProjects] = useState<ProjectWithTeamMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    status: [],
    methodology: [],
    priority: [],
    dateRange: { start: null, end: null },
    progressRange: { min: 0, max: 100 },
    budgetRange: { min: 0, max: 1000000 },
    tags: []
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });

  // UI state
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load projects data
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        
        const projectsData = await response.json();
        setProjects(projectsData);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Filtered and sorted projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = projects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          project.name,
          project.description,
          ...project.tags.map(t => t.tag),
          ...project.teamMembers.map(tm => tm.user.name)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false;
      }

      // Methodology filter
      if (filters.methodology.length > 0 && !filters.methodology.includes(project.methodology)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
        return false;
      }

      // Progress filter
      if (project.progress < filters.progressRange.min || project.progress > filters.progressRange.max) {
        return false;
      }

      // Budget filter
      if (project.budget && (project.budget < filters.budgetRange.min || project.budget > filters.budgetRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const projectDate = new Date(project.dueDate);
        if (filters.dateRange.start && projectDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && projectDate > filters.dateRange.end) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const projectTags = project.tags.map(t => t.tag);
        const hasMatchingTag = filters.tags.some(tag => projectTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[sortConfig.field as keyof typeof a];
      let bValue: any = b[sortConfig.field as keyof typeof b];

      // Handle special fields
      if (sortConfig.field === 'teamSize') {
        aValue = a.teamMembers.length;
        bValue = b.teamMembers.length;
      } else if (sortConfig.field === 'dueDate' || sortConfig.field === 'startDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
  }, [projects, filters, sortConfig]);

  // Calculate analytics data for charts
  const analyticsData = useMemo(() => {
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const methodologyCounts = projects.reduce((acc, project) => {
      acc[project.methodology] = (acc[project.methodology] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCounts = projects.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageProgress = projects.reduce((sum, project) => sum + project.progress, 0) / projects.length;

    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);

    // Overdue projects
    const now = new Date();
    const overdueProjects = projects.filter(project => 
      new Date(project.dueDate) < now && project.status !== 'completed'
    );

    // Progress distribution
    const progressDistribution = {
      'Not Started': projects.filter(p => p.progress === 0).length,
      'In Progress': projects.filter(p => p.progress > 0 && p.progress < 100).length,
      'Completed': projects.filter(p => p.progress === 100).length,
    };

    return {
      statusCounts,
      methodologyCounts,
      priorityCounts,
      averageProgress: Math.round(averageProgress),
      totalBudget,
      overdueCount: overdueProjects.length,
      progressDistribution,
      totalProjects: projects.length,
      activeProjects: statusCounts.active || 0
    };
  }, [projects]);

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Projects" subtitle="Loading your projects...">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="Projects" subtitle="Error loading projects">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Projects</h3>
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
      title="Projects" 
      subtitle={`${filteredAndSortedProjects.length} of ${projects.length} projects`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
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
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            projects={projects}
            filteredCount={filteredAndSortedProjects.length}
          />
        </motion.div>

        {/* Section 3: Dynamic View Engine */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="min-h-[600px]"
        >
          <ProjectViewEngine
            projects={filteredAndSortedProjects}
            viewMode={viewMode}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            loading={loading}
          />
        </motion.div>

      </div>
    </AppLayout>
  );
}