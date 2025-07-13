'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../../../components/layout/AppLayout';
import Link from 'next/link';
import { ProjectWithTeamMembers } from '../../../lib/database';

type ColumnType = 'todo' | 'inprogress' | 'done';

interface KanbanColumn {
  id: ColumnType;
  title: string;
  color: string;
  bgColor: string;
}

export default function AgileBoardPage() {
  const [allProjects, setAllProjects] = useState<ProjectWithTeamMembers[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load projects from API
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('/api/projects?methodology=agile');
        const projectsData = await response.json();
        setAllProjects(projectsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading projects:', error);
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);
  
  // Initialize projects with kanban status based on progress
  const [projects, setProjects] = useState<(ProjectWithTeamMembers & { kanbanStatus: ColumnType })[]>([]);
  
  // Update projects when allProjects changes
  useEffect(() => {
    if (allProjects.length > 0) {
      const projectsWithKanban = allProjects.map(project => ({
        ...project,
        kanbanStatus: project.progress < 30 ? 'todo' : 
                     project.progress < 80 ? 'inprogress' : 'done'
      }));
      setProjects(projectsWithKanban);
    }
  }, [allProjects]);

  const [draggedProject, setDraggedProject] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<ColumnType | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-400', bgColor: 'bg-gray-50' },
    { id: 'inprogress', title: 'In Progress', color: 'bg-yellow-400', bgColor: 'bg-yellow-50' },
    { id: 'done', title: 'Done', color: 'bg-green-400', bgColor: 'bg-green-50' }
  ];

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProject(projectId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', projectId);
    
    // Add some visual feedback
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedProject(null);
    setDraggedOver(null);
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOver(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: ColumnType) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData('text/plain');
    
    if (projectId && projectId !== columnId) {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, kanbanStatus: columnId }
          : project
      ));
      
      // Show success feedback
      const projectName = projects.find(p => p.id === projectId)?.name;
      const columnName = columns.find(c => c.id === columnId)?.title;
      setNotification(`✅ Moved "${projectName}" to ${columnName}`);
      
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
    
    setDraggedProject(null);
    setDraggedOver(null);
  };

  const getProjectsByColumn = (columnId: ColumnType) => {
    return projects.filter(project => project.kanbanStatus === columnId);
  };

  if (loading) {
    return (
      <AppLayout title="⚡ Agile Board" subtitle="Sprint-based Project Management">
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agile projects...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="⚡ Agile Board" subtitle="Sprint-based Project Management">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/projects" className="text-blue-600 hover:text-blue-800 mb-2 inline-block">
              ← Back to Projects
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Agile Project Board</h1>
            <p className="text-gray-600">Kanban-style view of your agile projects</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
            {projects.length} Agile Projects
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div 
              key={column.id}
              className={`${column.bgColor} rounded-lg p-4 min-h-[500px] transition-all duration-200 ${
                draggedOver === column.id ? 'ring-2 ring-blue-400 ring-opacity-50 scale-[1.02]' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-3 h-3 ${column.color} rounded-full mr-2`}></span>
                  {column.title}
                </div>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                  {getProjectsByColumn(column.id).length}
                </span>
              </h3>
              
              <div className="space-y-3">
                {getProjectsByColumn(column.id).map((project) => (
                  <div 
                    key={project.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, project.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white p-4 rounded-lg shadow-sm border cursor-move transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                      draggedProject === project.id ? 'opacity-50 rotate-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{project.name}</h4>
                      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        column.id === 'todo' ? 'bg-blue-100 text-blue-800' :
                        column.id === 'inprogress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.tags[0]?.tag}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">{project.progress}%</span>
                        <div className="w-8 bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              column.id === 'todo' ? 'bg-blue-500' :
                              column.id === 'inprogress' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Team members */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex -space-x-1">
                        {project.teamMembers.slice(0, 3).map((teamMember) => (
                          <div
                            key={teamMember.user.id}
                            className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white"
                            title={teamMember.user.name}
                          >
                            {teamMember.user.avatar}
                          </div>
                        ))}
                        {project.teamMembers.length > 3 && (
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold border border-white">
                            +{project.teamMembers.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {project.methodology}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Empty state */}
                {getProjectsByColumn(column.id).length === 0 && (
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    draggedOver === column.id ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <div className="text-gray-400 text-sm">
                      {draggedOver === column.id ? 'Drop here' : `No projects in ${column.title.toLowerCase()}`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Sprint Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Current Sprint Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-sm text-gray-500">Sprint Duration</span>
              <div className="text-2xl font-bold text-blue-600">2 weeks</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Velocity</span>
              <div className="text-2xl font-bold text-green-600">42 points</div>
            </div>
            <div>
              <span className="text-sm text-gray-500">Burndown</span>
              <div className="text-2xl font-bold text-orange-600">85%</div>
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {notification && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
            {notification}
          </div>
        )}
      </div>
    </AppLayout>
  );
}