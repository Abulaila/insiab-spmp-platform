'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { ProgramWithTeamMembers } from '../../lib/database';
import { motion, AnimatePresence } from 'framer-motion';

// Import view components (these will need to be created for programs)
import QuickChartsSection from '../../components/programs/QuickChartsSection';
import FilterSortSection from '../../components/programs/FilterSortSection';
import ProgramViewEngine from '../../components/programs/ProgramViewEngine';

// Types for filtering and sorting
export interface ProgramFilters {
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

export default function ProgramsPage() {
  // Core state
  const [programs, setPrograms] = useState<ProgramWithTeamMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<ProgramFilters>({
    search: '',
    status: [],
    methodology: [],
    priority: [],
    dateRange: { start: null, end: null },
    progressRange: { min: 0, max: 100 },
    budgetRange: { min: 0, max: 10000000 },
    tags: []
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });

  // UI state
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load programs data
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/programs');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch programs: ${response.statusText}`);
        }
        
        const programsData = await response.json();
        setPrograms(programsData);
      } catch (err) {
        console.error('Error loading programs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    loadPrograms();
  }, []);

  // Filtered and sorted programs
  const filteredAndSortedPrograms = useMemo(() => {
    const filtered = programs.filter(program => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          program.name,
          program.description,
          ...program.tags.map(t => t.tag),
          ...program.teamMembers.map(tm => tm.user.name)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(program.status)) {
        return false;
      }

      // Methodology filter
      if (filters.methodology.length > 0 && !filters.methodology.includes(program.methodology)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(program.priority)) {
        return false;
      }

      // Progress filter
      if (program.progress < filters.progressRange.min || program.progress > filters.progressRange.max) {
        return false;
      }

      // Budget filter
      if (program.budget && (program.budget < filters.budgetRange.min || program.budget > filters.budgetRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const programDate = new Date(program.dueDate);
        if (filters.dateRange.start && programDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && programDate > filters.dateRange.end) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const programTags = program.tags.map(t => t.tag);
        const hasMatchingTag = filters.tags.some(tag => programTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });

    // Sort the filtered programs
    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'methodology':
          aValue = a.methodology;
          bValue = b.methodology;
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'teamSize':
          aValue = a.teamMembers.length;
          bValue = b.teamMembers.length;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [programs, filters, sortConfig]);

  // Analytics data
  const analyticsData = useMemo(() => {
    if (programs.length === 0) {
      return {
        statusCounts: {},
        methodologyCounts: {},
        priorityCounts: {},
        averageProgress: 0,
        totalBudget: 0,
        overdueCount: 0,
        progressDistribution: {},
        totalPrograms: 0,
        activePrograms: 0
      };
    }

    // Status distribution
    const statusCounts = programs.reduce((acc, program) => {
      acc[program.status] = (acc[program.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Methodology distribution
    const methodologyCounts = programs.reduce((acc, program) => {
      acc[program.methodology] = (acc[program.methodology] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityCounts = programs.reduce((acc, program) => {
      acc[program.priority] = (acc[program.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average progress
    const averageProgress = programs.reduce((sum, program) => sum + program.progress, 0) / programs.length;

    const totalBudget = programs.reduce((sum, program) => sum + (program.budget || 0), 0);

    // Overdue programs
    const now = new Date();
    const overduePrograms = programs.filter(program => 
      new Date(program.dueDate) < now && program.status !== 'completed'
    );

    // Progress distribution
    const progressDistribution = {
      'Not Started': programs.filter(p => p.progress === 0).length,
      'In Progress': programs.filter(p => p.progress > 0 && p.progress < 100).length,
      'Completed': programs.filter(p => p.progress === 100).length,
    };

    return {
      statusCounts,
      methodologyCounts,
      priorityCounts,
      averageProgress: Math.round(averageProgress),
      totalBudget,
      overdueCount: overduePrograms.length,
      progressDistribution,
      totalPrograms: programs.length,
      activePrograms: statusCounts.active || 0
    };
  }, [programs]);

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Programs" subtitle="Loading your programs...">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading programs...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="Programs" subtitle="Error loading programs">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Programs</h3>
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
      title="Programs" 
      subtitle={`${filteredAndSortedPrograms.length} of ${programs.length} programs`}
    >
      <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Section 1: Quick Charts Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-2xl blur-xl transform -rotate-1"></div>
            <div className="relative">
              <QuickChartsSection analyticsData={analyticsData} />
            </div>
          </motion.div>

          {/* Section 2: Advanced Search/Filter/Sort Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-blue-600/5 rounded-2xl blur-xl transform rotate-1"></div>
            <div className="relative">
              <FilterSortSection
                filters={filters}
                setFilters={setFilters}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                selectedPrograms={selectedPrograms}
                setSelectedPrograms={setSelectedPrograms}
                programs={programs}
                filteredCount={filteredAndSortedPrograms.length}
              />
            </div>
          </motion.div>

          {/* Section 3: Dynamic View Engine */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative min-h-[600px]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-emerald-600/5 rounded-2xl blur-xl transform -rotate-1"></div>
            <div className="relative">
              <ProgramViewEngine
                programs={filteredAndSortedPrograms}
                viewMode={viewMode}
                selectedPrograms={selectedPrograms}
                setSelectedPrograms={setSelectedPrograms}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                loading={loading}
                setViewMode={setViewMode}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}