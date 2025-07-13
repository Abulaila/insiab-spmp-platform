'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../../components/layout/AppLayout';
import { ProgramWithTeamMembers } from '../../../lib/database';

interface ProgramDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const [program, setProgram] = useState<ProgramWithTeamMembers | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClientSide(true);
    
    // Handle async params and load program data
    const loadProgram = async () => {
      try {
        const resolvedParams = await params;
        setLoading(true);
        
        const response = await fetch(`/api/programs/${resolvedParams.id}`);
        if (response.ok) {
          const programData = await response.json();
          setProgram(programData);
        } else {
          setProgram(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading program:', error);
        setProgram(null);
        setLoading(false);
      }
    };
    
    loadProgram();
  }, [params]);

  const handleEditProgram = () => {
    setShowEditModal(true);
  };

  const handleDeleteProgram = async () => {
    if (!program || !confirm('Are you sure you want to delete this program?')) return;
    
    try {
      const response = await fetch(`/api/programs/${program.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Redirect to programs list
        window.location.href = '/programs';
      }
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!isClientSide) {
    return null;
  }

  if (loading) {
    return (
      <AppLayout title="Loading Program..." subtitle="Please wait">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (!program) {
    return (
      <AppLayout title="Program Not Found" subtitle="The program you're looking for doesn't exist">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Program Not Found</h3>
            <p className="text-gray-600 dark:text-gray-400">The program you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
            <Link 
              href="/programs"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Programs
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout 
      title={program.name} 
      subtitle={`${program.methodology.charAt(0).toUpperCase() + program.methodology.slice(1)} Program`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/programs" className="text-brand-600 hover:text-brand-800 dark:text-brand-400">
                Programs
              </Link>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">{program.name}</span>
            </li>
          </ol>
        </nav>

        {/* Program Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{program.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(program.status)}`}>
                  {program.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(program.priority)}`}>
                  {program.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {program.description}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">{program.progress}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${program.budget?.toLocaleString() || '0'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Budget</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{program.teamMembers.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Team Members</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{program.tags.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Tags</div>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative ml-6">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                  <button
                    onClick={handleEditProgram}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                  >
                    Edit Program
                  </button>
                  <button
                    onClick={handleDeleteProgram}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                  >
                    Delete Program
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
              <span className="text-gray-900 dark:text-white font-medium">{program.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${program.progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Program Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Dates and Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Timeline</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(program.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(program.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(program.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Updated</label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(program.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {program.tags.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {program.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-800 dark:text-brand-300 rounded-full text-sm"
                    >
                      {tag.tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Program Creator */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program Creator</h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {program.creator.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{program.creator.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{program.creator.role}</p>
                </div>
              </div>
            </div>

            {/* Team Members */}
            {program.teamMembers.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Team Members ({program.teamMembers.length})
                </h3>
                <div className="space-y-3">
                  {program.teamMembers.map((member) => (
                    <div key={member.user.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {member.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{member.user.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{member.user.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Program Stats */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Program Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Methodology</span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {program.methodology}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status</span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {program.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Priority</span>
                  <span className="text-gray-900 dark:text-white font-medium capitalize">
                    {program.priority}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal placeholder - to be implemented */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Program</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Program editing functionality will be implemented in the next phase.
            </p>
            <button
              onClick={() => setShowEditModal(false)}
              className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}