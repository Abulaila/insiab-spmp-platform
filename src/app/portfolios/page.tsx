'use client';

import { useState, useEffect, useMemo } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';

// Import view components (these will be created for portfolios)
import QuickChartsSection from '../../components/portfolios/QuickChartsSection';
import FilterSortSection from '../../components/portfolios/FilterSortSection';
import PortfolioViewEngine from '../../components/portfolios/PortfolioViewEngine';
import { PortfolioWithDetails } from '../../lib/database';

// Use the type from database.ts instead of redefining it here

// Types for filtering and sorting
export interface PortfolioFilters {
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

export default function PortfoliosPage() {
  // Core state
  const [portfolios, setPortfolios] = useState<PortfolioWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [filters, setFilters] = useState<PortfolioFilters>({
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
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load portfolios data
  useEffect(() => {
    const loadPortfolios = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/portfolios');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
        }
        
        const portfoliosData = await response.json();
        setPortfolios(portfoliosData);
      } catch (err) {
        console.error('Error loading portfolios:', err);
        setError(err instanceof Error ? err.message : 'Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolios();
  }, []);

  // Filtered and sorted portfolios
  const filteredAndSortedPortfolios = useMemo(() => {
    const filtered = portfolios.filter(portfolio => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          portfolio.name,
          portfolio.description,
          ...portfolio.tags.map(t => t.tag),
          ...portfolio.teamMembers.map(tm => tm.user.name),
          ...portfolio.projects.map(p => p.name)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(portfolio.status)) {
        return false;
      }

      // Methodology filter
      if (filters.methodology.length > 0 && !filters.methodology.includes(portfolio.methodology)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(portfolio.priority)) {
        return false;
      }

      // Progress filter
      if (portfolio.progress < filters.progressRange.min || portfolio.progress > filters.progressRange.max) {
        return false;
      }

      // Budget filter
      if (portfolio.budget && (portfolio.budget < filters.budgetRange.min || portfolio.budget > filters.budgetRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const portfolioDate = new Date(portfolio.dueDate);
        if (filters.dateRange.start && portfolioDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end && portfolioDate > filters.dateRange.end) {
          return false;
        }
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const portfolioTags = portfolio.tags.map(t => t.tag);
        const hasMatchingTag = filters.tags.some(tag => portfolioTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });

    // Sort the filtered portfolios
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
        case 'projectCount':
          aValue = a.projects.length;
          bValue = b.projects.length;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [portfolios, filters, sortConfig]);

  // Analytics data
  const analyticsData = useMemo(() => {
    if (portfolios.length === 0) {
      return {
        statusCounts: {},
        methodologyCounts: {},
        priorityCounts: {},
        averageProgress: 0,
        totalBudget: 0,
        overdueCount: 0,
        progressDistribution: {},
        totalPortfolios: 0,
        activePortfolios: 0,
        totalProjects: 0,
        averageProjectsPerPortfolio: 0
      };
    }

    // Status distribution
    const statusCounts = portfolios.reduce((acc, portfolio) => {
      acc[portfolio.status] = (acc[portfolio.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Methodology distribution
    const methodologyCounts = portfolios.reduce((acc, portfolio) => {
      acc[portfolio.methodology] = (acc[portfolio.methodology] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Priority distribution
    const priorityCounts = portfolios.reduce((acc, portfolio) => {
      acc[portfolio.priority] = (acc[portfolio.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average progress
    const averageProgress = portfolios.reduce((sum, portfolio) => sum + portfolio.progress, 0) / portfolios.length;

    const totalBudget = portfolios.reduce((sum, portfolio) => sum + (portfolio.budget || 0), 0);

    // Overdue portfolios
    const now = new Date();
    const overduePortfolios = portfolios.filter(portfolio => 
      new Date(portfolio.dueDate) < now && portfolio.status !== 'completed'
    );

    // Progress distribution
    const progressDistribution = {
      'Not Started': portfolios.filter(p => p.progress === 0).length,
      'In Progress': portfolios.filter(p => p.progress > 0 && p.progress < 100).length,
      'Completed': portfolios.filter(p => p.progress === 100).length,
    };

    // Project counts
    const totalProjects = portfolios.reduce((sum, portfolio) => sum + portfolio.projects.length, 0);
    const averageProjectsPerPortfolio = portfolios.length > 0 ? totalProjects / portfolios.length : 0;

    return {
      statusCounts,
      methodologyCounts,
      priorityCounts,
      averageProgress: Math.round(averageProgress),
      totalBudget,
      overdueCount: overduePortfolios.length,
      progressDistribution,
      totalPortfolios: portfolios.length,
      activePortfolios: statusCounts.active || 0,
      totalProjects,
      averageProjectsPerPortfolio: Math.round(averageProjectsPerPortfolio * 10) / 10
    };
  }, [portfolios]);

  // Loading state
  if (loading) {
    return (
      <AppLayout title="Portfolios" subtitle="Loading your portfolios...">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading portfolios...</p>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout title="Portfolios" subtitle="Error loading portfolios">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Failed to Load Portfolios</h3>
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
      title="Portfolios" 
      subtitle={`${filteredAndSortedPortfolios.length} of ${portfolios.length} portfolios`}
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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-2xl blur-xl transform -rotate-1"></div>
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-purple-600/5 rounded-2xl blur-xl transform rotate-1"></div>
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
                selectedPortfolios={selectedPortfolios}
                setSelectedPortfolios={setSelectedPortfolios}
                portfolios={portfolios}
                filteredCount={filteredAndSortedPortfolios.length}
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
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-emerald-600/5 rounded-2xl blur-xl transform -rotate-1"></div>
            <div className="relative">
              <PortfolioViewEngine
                portfolios={filteredAndSortedPortfolios}
                viewMode={viewMode}
                selectedPortfolios={selectedPortfolios}
                setSelectedPortfolios={setSelectedPortfolios}
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