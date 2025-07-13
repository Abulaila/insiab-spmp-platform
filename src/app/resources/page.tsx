'use client';

import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const resources = [
    {
      id: 1,
      title: 'Project Management Best Practices',
      description: 'Comprehensive guide to effective project management methodologies and techniques.',
      category: 'Documentation',
      type: 'Guide',
      lastUpdated: '2025-07-10',
      author: 'Sarah Chen',
      downloads: 245,
      tags: ['PM', 'Best Practices', 'Methodology']
    },
    {
      id: 2,
      title: 'API Documentation',
      description: 'Complete API reference for ProjectOS integration and development.',
      category: 'Technical',
      type: 'API Docs',
      lastUpdated: '2025-07-08',
      author: 'Alex Rodriguez',
      downloads: 189,
      tags: ['API', 'Integration', 'Development']
    },
    {
      id: 3,
      title: 'Agile Sprint Planning Template',
      description: 'Ready-to-use templates for sprint planning and retrospectives.',
      category: 'Templates',
      type: 'Template',
      lastUpdated: '2025-07-05',
      author: 'Emily Johnson',
      downloads: 342,
      tags: ['Agile', 'Sprint', 'Template']
    },
    {
      id: 4,
      title: 'Security Guidelines',
      description: 'Enterprise security protocols and compliance requirements.',
      category: 'Security',
      type: 'Guidelines',
      lastUpdated: '2025-07-03',
      author: 'David Thompson',
      downloads: 156,
      tags: ['Security', 'Compliance', 'Enterprise']
    },
    {
      id: 5,
      title: 'UI/UX Design System',
      description: 'Complete design system with components, patterns, and guidelines.',
      category: 'Design',
      type: 'Design System',
      lastUpdated: '2025-07-01',
      author: 'Emily Johnson',
      downloads: 278,
      tags: ['Design', 'UI/UX', 'Components']
    },
    {
      id: 6,
      title: 'Troubleshooting Guide',
      description: 'Common issues and solutions for ProjectOS platform.',
      category: 'Support',
      type: 'Troubleshooting',
      lastUpdated: '2025-06-28',
      author: 'James Wilson',
      downloads: 198,
      tags: ['Support', 'Troubleshooting', 'FAQ']
    },
    {
      id: 7,
      title: 'Training Materials',
      description: 'Onboarding and training resources for new team members.',
      category: 'Training',
      type: 'Course',
      lastUpdated: '2025-06-25',
      author: 'Lisa Park',
      downloads: 312,
      tags: ['Training', 'Onboarding', 'Education']
    },
    {
      id: 8,
      title: 'Data Export Formats',
      description: 'Supported data formats and export procedures.',
      category: 'Technical',
      type: 'Documentation',
      lastUpdated: '2025-06-20',
      author: 'Jessica Wu',
      downloads: 134,
      tags: ['Data', 'Export', 'Formats']
    }
  ];

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const resourceStats = {
    total: resources.length,
    totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
    recentlyUpdated: resources.filter(r => new Date(r.lastUpdated) > new Date('2025-07-01')).length,
    categories: categories.length - 1
  };

  return (
    <AppLayout title="📚 Resources Hub" subtitle="Documentation & Knowledge Base">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resources & Documentation</h1>
            <p className="text-gray-600">Access guides, templates, and knowledge base</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            📤 Upload Resource
          </button>
        </div>

        {/* Resource Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Total Resources</div>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">📚</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{resourceStats.total}</div>
            <div className="text-sm text-gray-500">{resourceStats.categories} categories</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Total Downloads</div>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg">📥</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{resourceStats.totalDownloads.toLocaleString()}</div>
            <div className="text-sm text-green-600">↗ +23% this month</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Recently Updated</div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg">🔄</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{resourceStats.recentlyUpdated}</div>
            <div className="text-sm text-gray-500">This month</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">Avg Rating</div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-lg">⭐</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
            <div className="text-sm text-gray-500">Out of 5 stars</div>
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
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Access Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Documentation', 'Templates', 'Training', 'Technical', 'Design', 'Security'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedCategory === category
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="text-2xl mb-2">
                {category === 'Documentation' ? '📄' :
                 category === 'Templates' ? '📋' :
                 category === 'Training' ? '🎓' :
                 category === 'Technical' ? '⚙️' :
                 category === 'Design' ? '🎨' : '🔒'}
              </div>
              <div className="text-sm font-medium">{category}</div>
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              {/* Resource Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{resource.title}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      resource.category === 'Documentation' ? 'bg-blue-100 text-blue-800' :
                      resource.category === 'Templates' ? 'bg-green-100 text-green-800' :
                      resource.category === 'Training' ? 'bg-purple-100 text-purple-800' :
                      resource.category === 'Technical' ? 'bg-orange-100 text-orange-800' :
                      resource.category === 'Design' ? 'bg-pink-100 text-pink-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {resource.type}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                </div>
              </div>

              {/* Resource Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Author:</span>
                  <span className="font-medium">{resource.author}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="font-medium">{new Date(resource.lastUpdated).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Downloads:</span>
                  <span className="font-medium">{resource.downloads}</span>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {resource.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resource Actions */}
              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  📥 Download
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  👁️ Preview
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  ⭐ Rate
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">📞</div>
              <div className="font-medium mb-1">Contact Support</div>
              <div className="text-sm opacity-90">Get help from our support team</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <div className="font-medium mb-1">Community Forum</div>
              <div className="text-sm opacity-90">Connect with other users</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📖</div>
              <div className="font-medium mb-1">Knowledge Base</div>
              <div className="text-sm opacity-90">Browse comprehensive guides</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}