'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import { teamMembers } from '../../data/projects';

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddMember, setShowAddMember] = useState(false);

  // Extended team data with additional members
  const extendedTeam = [
    ...teamMembers,
    { 
      id: '9', 
      name: 'Rachel Green', 
      avatar: '👩‍💻', 
      role: 'Senior Developer', 
      email: 'rachel@projectos.com',
      status: 'active',
      location: 'Remote',
      projects: 3,
      expertise: ['React', 'Node.js', 'TypeScript']
    },
    { 
      id: '10', 
      name: 'Marcus Johnson', 
      avatar: '👨‍🎨', 
      role: 'Creative Director', 
      email: 'marcus@projectos.com',
      status: 'active',
      location: 'New York',
      projects: 2,
      expertise: ['Design Systems', 'Branding', 'UI/UX']
    },
    { 
      id: '11', 
      name: 'Sophie Chen', 
      avatar: '👩‍🔬', 
      role: 'Product Manager', 
      email: 'sophie@projectos.com',
      status: 'active',
      location: 'San Francisco',
      projects: 4,
      expertise: ['Product Strategy', 'Analytics', 'Roadmapping']
    },
    { 
      id: '12', 
      name: 'Oliver Zhang', 
      avatar: '👨‍💼', 
      role: 'Scrum Master', 
      email: 'oliver@projectos.com',
      status: 'active',
      location: 'Toronto',
      projects: 5,
      expertise: ['Agile', 'Team Coaching', 'Process Optimization']
    }
  ].map(member => ({
    ...member,
    status: member.status || 'active',
    location: member.location || 'Office',
    projects: member.projects || Math.floor(Math.random() * 5) + 1,
    expertise: member.expertise || ['General']
  }));

  const roles = ['all', ...Array.from(new Set(extendedTeam.map(member => member.role)))];

  const filteredTeam = extendedTeam.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const teamStats = {
    total: extendedTeam.length,
    active: extendedTeam.filter(m => m.status === 'active').length,
    totalProjects: extendedTeam.reduce((sum, m) => sum + m.projects, 0),
    avgProjectsPerMember: Math.round(extendedTeam.reduce((sum, m) => sum + m.projects, 0) / extendedTeam.length * 10) / 10
  };

  return (
    <AppLayout title="👥 Team Management" subtitle="Team Members & Collaboration">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage team members, roles, and collaboration</p>
          </div>
          <button 
            onClick={() => setShowAddMember(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Team Member
          </button>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Total Members</div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{teamStats.total}</div>
            <div className="text-sm text-gray-500">{teamStats.active} active members</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Active Projects</div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📁</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{teamStats.totalProjects}</div>
            <div className="text-sm text-gray-500">Across all members</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Avg Projects/Member</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">📊</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{teamStats.avgProjectsPerMember}</div>
            <div className="text-sm text-gray-500">Workload distribution</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Team Utilization</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">⚡</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">87%</div>
            <div className="text-sm text-green-600">↗ +5% from last month</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member) => (
            <div key={member.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              {/* Member Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Email:</span>
                  <span className="text-blue-600">{member.email}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-medium">{member.location}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Active Projects:</span>
                  <span className="font-medium">{member.projects}</span>
                </div>

                {/* Expertise Tags */}
                <div>
                  <div className="text-sm text-gray-500 mb-2">Expertise:</div>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.slice(0, 3).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {member.expertise.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{member.expertise.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Member Actions */}
              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Profile
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Message
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  ⋯
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Add Team Member</h3>
                <button
                  onClick={() => setShowAddMember(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="name@projectos.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select role...</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="QA Engineer">QA Engineer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAddMember(false);
                      alert('✅ Team member added successfully!');
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Member
                  </button>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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