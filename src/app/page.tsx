'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../components/layout/AppLayout';
import AIInsightsDashboard from '../components/ai/AIInsightsDashboard';
import PredictiveAnalyticsDashboard from '../components/analytics/PredictiveAnalyticsDashboard';

export default function HomePage() {
  const [suggestedAction, setSuggestedAction] = useState<string>('Review 3 overdue projects');
  const [projectsData, setProjectsData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [showFullDashboard, setShowFullDashboard] = useState(false);
  const [showPredictiveAnalytics, setShowPredictiveAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data for AI insights - OPTIMIZED WITH TIMEOUTS
  useEffect(() => {
    const loadData = async () => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        // Load projects with timeout
        try {
          const projectsResponse = await fetch('/api/projects', {
            signal: controller.signal
          });
          if (projectsResponse.ok) {
            const projects = await projectsResponse.json();
            setProjectsData(projects);
          }
        } catch (error) {
          console.warn('Failed to load projects for dashboard:', error);
        }

        // Load tasks with timeout
        try {
          const tasksResponse = await fetch('/api/tasks', {
            signal: controller.signal
          });
          if (tasksResponse.ok) {
            const tasks = await tasksResponse.json();
            setTasksData(tasks);
          }
        } catch (error) {
          console.warn('Failed to load tasks for dashboard:', error);
        }

        clearTimeout(timeoutId);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        // Set loading to false after a short delay regardless of API calls
        setTimeout(() => setIsLoading(false), 500);
      }
    };

    loadData();
  }, []);

  // AI-powered contextual suggestion
  useEffect(() => {
    const suggestions = [
      'Review 3 overdue projects',
      'Check team velocity trends',
      'Update project milestones',
      'Review AI recommendations'
    ];
    
    // Simulate AI recommendation based on time of day and data
    const hour = new Date().getHours();
    const suggestion = hour < 12 ? suggestions[0] : 
                     hour < 15 ? suggestions[1] : 
                     hour < 18 ? suggestions[2] : suggestions[3];
    
    setSuggestedAction(suggestion);
  }, [projectsData, tasksData]);

  // Show loading screen while data is loading
  if (isLoading) {
    return (
      <AppLayout 
        title="Loading..." 
        subtitle=""
      >
        <div className="min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
          <div className="w-full max-w-lg mx-auto text-center space-y-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-10 h-10 text-white" viewBox="0 0 100 50" fill="currentColor">
                <path d="M10 25 Q30 10 50 25 Q70 40 90 25" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="15" cy="22" r="1.5" fill="currentColor"/>
                <circle cx="25" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="35" cy="30" r="1.5" fill="currentColor"/>
                <circle cx="65" cy="30" r="1.5" fill="currentColor"/>
                <circle cx="75" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="85" cy="22" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Loading your workspace...
              </h1>
              <p className="text-sm text-gray-600">
                Insiab: The AI OS that powers your business for now and next
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title="What will you work on today?" 
      subtitle=""
    >
      <div className="min-h-screen flex flex-col items-center justify-center px-4 -mt-16">
        <div className="w-full max-w-lg mx-auto text-center space-y-8">
          
          {/* Main Focus */}
          <div className="space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" viewBox="0 0 100 50" fill="currentColor">
                <path d="M10 25 Q30 10 50 25 Q70 40 90 25" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="15" cy="22" r="1.5" fill="currentColor"/>
                <circle cx="25" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="35" cy="30" r="1.5" fill="currentColor"/>
                <circle cx="65" cy="30" r="1.5" fill="currentColor"/>
                <circle cx="75" cy="18" r="1.5" fill="currentColor"/>
                <circle cx="85" cy="22" r="1.5" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                What will you work on today?
              </h1>
              <p className="text-sm text-gray-600">
                Insiab: The AI OS that powers your business for now and next
              </p>
            </div>
          </div>

          {/* AI Suggested Action */}
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-brand-900">AI suggests:</p>
                  <p className="text-brand-700">{suggestedAction}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullDashboard(!showFullDashboard)}
                className="text-xs text-brand-600 hover:text-brand-800 underline"
              >
                {showFullDashboard ? 'hide' : 'why?'}
              </button>
            </div>
          </div>

          {/* AI Insights Dashboard - Conditional */}
          {showFullDashboard && !showPredictiveAnalytics && (
            <div className="w-full max-w-6xl mx-auto">
              <AIInsightsDashboard 
                projectsData={projectsData}
                tasksData={tasksData}
                portfoliosData={[]}
              />
            </div>
          )}

          {/* Predictive Analytics Dashboard - Conditional */}
          {showPredictiveAnalytics && (
            <div className="w-full max-w-7xl mx-auto">
              <PredictiveAnalyticsDashboard 
                projects={projectsData}
                tasks={tasksData}
              />
            </div>
          )}

          {/* Dashboard Toggle Buttons */}
          {(showFullDashboard || showPredictiveAnalytics) && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setShowFullDashboard(true);
                  setShowPredictiveAnalytics(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFullDashboard && !showPredictiveAnalytics
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                AI Insights
              </button>
              <button
                onClick={() => {
                  setShowPredictiveAnalytics(true);
                  setShowFullDashboard(false);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showPredictiveAnalytics
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Predictive Analytics
              </button>
              <button
                onClick={() => {
                  setShowFullDashboard(false);
                  setShowPredictiveAnalytics(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Hide Dashboards
              </button>
            </div>
          )}

          {/* Primary Actions */}
          <div className="space-y-3">
            <Link 
              href="/projects" 
              className="block w-full bg-brand-600 text-white px-6 py-4 rounded-xl font-medium hover:bg-brand-700 transition-colors text-lg shadow-sm"
            >
              View Projects
            </Link>
            
            <button 
              className="block w-full bg-gray-100 text-gray-900 px-6 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              onClick={() => alert('🚀 Quick create coming soon!')}
            >
              Create Project
            </button>

            {/* Advanced Analytics Button */}
            <button 
              onClick={() => {
                setShowPredictiveAnalytics(true);
                setShowFullDashboard(false);
              }}
              className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              🔮 Predictive Analytics
            </button>
          </div>

          {/* Quick Stats - Progressive Disclosure */}
          <details className="group">
            <summary className="cursor-pointer text-gray-600 hover:text-gray-900 text-sm font-medium list-none">
              <div className="flex items-center justify-center space-x-2">
                <span>Quick overview</span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </summary>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">247</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-success-600">94.7%</div>
                <div className="text-sm text-gray-600">Success</div>
              </div>
            </div>
          </details>

          {/* System Status - Enhanced */}
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span>AI Analysis Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>Real-time Sync</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                <span>3 Team Members Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}