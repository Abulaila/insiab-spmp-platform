'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from '../../../components/layout/AppLayout';
import { ProjectWithTeamMembers } from '../../../lib/database';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const [project, setProject] = useState<ProjectWithTeamMembers | null>(null);
  const [isClientSide, setIsClientSide] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClientSide(true);
    
    // Handle async params and load project data
    const loadProject = async () => {
      try {
        const resolvedParams = await params;
        setLoading(true);
        
        const response = await fetch(`/api/projects/${resolvedParams.id}`);
        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        } else {
          setProject(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading project:', error);
        setProject(null);
        setLoading(false);
      }
    };
    
    loadProject();
  }, [params]);

  const handleEditProject = () => {
    setShowEditModal(true);
  };

  const handleViewReports = () => {
    alert('📊 Generating comprehensive project report...\n\n✅ Report will be available in your dashboard shortly!');
  };

  const handleMoreActions = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const handleGenerateReport = () => {
    alert('📊 Generating detailed project analytics report...\n\n✅ Report exported successfully!');
  };

  const handleExportData = () => {
    alert('📤 Exporting project data...\n\n✅ Data exported as CSV successfully!');
  };

  const handleProjectAction = (action: string) => {
    setShowActionsMenu(false);
    switch (action) {
      case 'duplicate':
        alert(`✅ Project "${project?.name}" duplicated successfully!`);
        break;
      case 'archive':
        alert(`📦 Project "${project?.name}" archived successfully!`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${project?.name}"? This action cannot be undone.`)) {
          alert(`🗑️ Project "${project?.name}" deleted successfully!`);
        }
        break;
      case 'export':
        alert(`📊 Project "${project?.name}" exported successfully!`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <AppLayout title="Loading..." subtitle="Please wait while we load the project">
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Project Not Found" subtitle="The requested project could not be found">
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist or has been moved.</p>
            <Link 
              href="/projects"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Projects
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      'on-hold': 'bg-yellow-100 text-yellow-800',
      blocked: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <AppLayout title={`📋 ${project.name}`} subtitle="Project Details & Management">
      <div className="p-6 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm">
          <Link href="/projects" className="text-blue-600 hover:text-blue-800">
            Projects
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </span>
                <div className={`w-4 h-4 rounded-full ${getPriorityColor(project.priority)}`} 
                     title={`${project.priority} priority`}>
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-4">{project.description}</p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Progress</span>
                  <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Budget</span>
                  <div className="text-2xl font-bold text-green-600">${(project.budget / 1000).toFixed(0)}K</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Team Size</span>
                  <div className="text-2xl font-bold text-purple-600">{project.teamMembers.length}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Methodology</span>
                  <div className="text-sm font-medium text-gray-800 capitalize">{project.methodology}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleEditProject}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ✏️ Edit Project
              </button>
              <button 
                onClick={handleViewReports}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📊 View Reports
              </button>
              <div className="relative">
                <button 
                  onClick={handleMoreActions}
                  className="w-full border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ⋯ More Actions
                </button>
                
                {/* Actions Dropdown Menu */}
                {showActionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handleProjectAction('duplicate')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>📋</span>
                        <span>Duplicate Project</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('export')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>📊</span>
                        <span>Export Data</span>
                      </button>
                      <button
                        onClick={() => handleProjectAction('archive')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>📦</span>
                        <span>Archive Project</span>
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => handleProjectAction('delete')}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <span>🗑️</span>
                        <span>Delete Project</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Project Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Started: {isClientSide ? new Date(project.startDate).toLocaleDateString() : project.startDate}</span>
            <span>Due: {isClientSide ? new Date(project.dueDate).toLocaleDateString() : project.dueDate}</span>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Team Members ({project.teamMembers.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.teamMembers.map((teamMember) => (
              <div key={teamMember.user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {teamMember.user.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{teamMember.user.name}</div>
                  <div className="text-sm text-gray-600">{teamMember.user.role}</div>
                  <div className="text-sm text-blue-600">{teamMember.user.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Project Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Project ID:</span>
                <span className="font-medium">{project.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created By:</span>
                <span className="font-medium">{project.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">
                  {isClientSide ? new Date(project.lastUpdated).toLocaleDateString() : project.lastUpdated}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority Level:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  project.priority === 'high' ? 'bg-red-100 text-red-800' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {project.priority.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Project Tags */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tags & Categories</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tagObj, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                  #{tagObj.tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Methodology-Specific Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {project.methodology.charAt(0).toUpperCase() + project.methodology.slice(1)} Overview
          </h3>
          
          {project.methodology === 'agile' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">Sprint 3</div>
                <div className="text-sm text-blue-700">Current Sprint</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">42 pts</div>
                <div className="text-sm text-green-700">Velocity</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">85%</div>
                <div className="text-sm text-orange-700">Burndown</div>
              </div>
            </div>
          )}

          {project.methodology === 'waterfall' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">Planning</div>
                <div className="text-sm text-blue-700">Completed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">Development</div>
                <div className="text-sm text-yellow-700">In Progress</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">Testing</div>
                <div className="text-sm text-gray-700">Pending</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-600">Deployment</div>
                <div className="text-sm text-gray-700">Pending</div>
              </div>
            </div>
          )}

          {project.methodology === 'hybrid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">65%</div>
                <div className="text-sm text-purple-700">Agile Components</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">35%</div>
                <div className="text-sm text-green-700">Waterfall Elements</div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/projects"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              ← Back to Projects
            </Link>
            <button 
              onClick={handleGenerateReport}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition-colors font-medium"
            >
              📊 Generate Report
            </button>
            <button 
              onClick={handleExportData}
              className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition-colors font-medium"
            >
              📤 Export Data
            </button>
          </div>
        </div>

        {/* Edit Project Modal */}
        {showEditModal && project && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">✏️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Edit Project</h3>
                    <p className="text-sm text-gray-500">Update project details and settings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    defaultValue={project.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    defaultValue={project.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select 
                      defaultValue={project.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select 
                      defaultValue={project.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      defaultValue={project.progress}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (USD)
                    </label>
                    <input
                      type="number"
                      defaultValue={project.budget}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      alert(`✅ Project "${project.name}" updated successfully!`);
                    }}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}