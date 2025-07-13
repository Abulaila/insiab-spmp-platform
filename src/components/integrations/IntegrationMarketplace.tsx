'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { integrationEngine, Integration, IntegrationCategory } from '../../lib/integrations/integration-engine';

interface IntegrationMarketplaceProps {
  className?: string;
}

const CATEGORY_ICONS: { [key: string]: string } = {
  project_management: '📋',
  development_tools: '⚒️',
  communication: '💬',
  document_management: '📄',
  time_tracking: '⏰',
  financial: '💰',
  hr_tools: '👥',
  crm: '🤝',
  analytics: '📊',
  security: '🔒',
  infrastructure: '🏗️',
  automation: '🤖',
  ai_ml: '🧠',
  business_intelligence: '🔍'
};

const PRICING_COLORS = {
  free: 'bg-green-100 text-green-800',
  freemium: 'bg-blue-100 text-blue-800', 
  subscription: 'bg-purple-100 text-purple-800',
  usage_based: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-gray-100 text-gray-800'
};

export default function IntegrationMarketplace({ className = '' }: IntegrationMarketplaceProps) {
  const [selectedTab, setSelectedTab] = useState<'marketplace' | 'installed' | 'templates'>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [marketplace, setMarketplace] = useState<Integration[]>([]);
  const [installed, setInstalled] = useState<Integration[]>([]);
  const [filters, setFilters] = useState({
    featured: false,
    verified: false,
    priceType: 'all'
  });

  useEffect(() => {
    // Load marketplace data
    const marketplaceData = integrationEngine.getMarketplace();
    setMarketplace(marketplaceData);

    // Load installed integrations
    const installedData = integrationEngine.getInstalledIntegrations();
    setInstalled(installedData);
  }, []);

  const filteredIntegrations = useMemo(() => {
    let filtered = marketplace;

    // Search filter
    if (searchQuery) {
      filtered = integrationEngine.searchMarketplace(searchQuery, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }

    // Additional filters
    if (filters.featured) {
      filtered = filtered.filter(i => i.marketplace.featured);
    }
    if (filters.verified) {
      filtered = filtered.filter(i => i.provider.verified);
    }
    if (filters.priceType !== 'all') {
      filtered = filtered.filter(i => i.pricing.type === filters.priceType);
    }

    return filtered;
  }, [marketplace, searchQuery, selectedCategory, filters]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(marketplace.map(i => i.category)));
    return cats.sort();
  }, [marketplace]);

  const handleInstall = async (integration: Integration) => {
    try {
      const installed = integrationEngine.installIntegration(integration.id);
      setInstalled(prev => [...prev, installed]);
      setShowInstallModal(false);
      setSelectedIntegration(null);
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const getProviderLogo = (provider: string) => {
    // Mock provider logos - in real app these would be actual images
    const logos: { [key: string]: string } = {
      atlassian: '🔵',
      github: '⚫',
      slack: '🟢',
      microsoft: '🔶',
      google: '🔴'
    };
    return logos[provider] || '🔧';
  };

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '✨' : '');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Integration Marketplace</h2>
              <p className="text-violet-100">Connect your favorite tools and streamline workflows</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-violet-100">Available</div>
              <div className="text-2xl font-bold">{marketplace.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-violet-100">Installed</div>
              <div className="text-2xl font-bold">{installed.length}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-sm text-violet-100">Categories</div>
              <div className="text-2xl font-bold">{categories.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'marketplace', label: 'Marketplace', icon: '🏪' },
            { key: 'installed', label: 'Installed', icon: '✅' },
            { key: 'templates', label: 'Templates', icon: '📝' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {CATEGORY_ICONS[category]} {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters */}
      {selectedTab === 'marketplace' && (
        <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="featured"
              checked={filters.featured}
              onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured Only</label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={filters.verified}
              onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.checked }))}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="verified" className="text-sm font-medium text-gray-700">Verified Only</label>
          </div>

          <select
            value={filters.priceType}
            onChange={(e) => setFilters(prev => ({ ...prev, priceType: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="all">All Pricing</option>
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="subscription">Subscription</option>
            <option value="usage_based">Usage Based</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      )}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === 'marketplace' && (
          <motion.div
            key="marketplace"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Featured Integrations */}
            {!searchQuery && selectedCategory === 'all' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Featured Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplace.filter(i => i.marketplace.featured).slice(0, 6).map((integration) => (
                    <div key={integration.id} className="bg-white rounded-lg p-6 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getProviderLogo(integration.provider.id)}</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                            <p className="text-sm text-gray-500">{integration.provider.name}</p>
                          </div>
                        </div>
                        {integration.marketplace.featured && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm">{getRatingStars(integration.marketplace.rating)}</span>
                            <span className="text-sm text-gray-500">({integration.marketplace.reviews})</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRICING_COLORS[integration.pricing.type]}`}>
                            {integration.pricing.type}
                          </span>
                        </div>
                        {integration.provider.verified && (
                          <span className="text-blue-600 text-sm">✓ Verified</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {integration.marketplace.downloads.toLocaleString()} downloads
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedIntegration(integration)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIntegration(integration);
                              setShowInstallModal(true);
                            }}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            Install
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Integrations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {searchQuery ? `Search Results (${filteredIntegrations.length})` : 'All Integrations'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredIntegrations.map((integration) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getProviderLogo(integration.provider.id)}</span>
                        <span className="text-lg">{CATEGORY_ICONS[integration.category]}</span>
                      </div>
                      {integration.marketplace.featured && (
                        <span className="text-yellow-500 text-sm">⭐</span>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {integration.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{integration.provider.name}</p>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{integration.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{getRatingStars(integration.marketplace.rating)}</span>
                      <span>{integration.marketplace.downloads.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${PRICING_COLORS[integration.pricing.type]}`}>
                        {integration.pricing.type}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setShowInstallModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                      >
                        Install
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === 'installed' && (
          <motion.div
            key="installed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {installed.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Integrations Installed</h3>
                <p className="text-gray-600 mb-4">Browse the marketplace to find and install integrations</p>
                <button
                  onClick={() => setSelectedTab('marketplace')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {installed.map((integration) => (
                  <div key={integration.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getProviderLogo(integration.provider.id)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                          <p className="text-sm text-gray-500">{integration.provider.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        integration.status === 'active' ? 'bg-green-100 text-green-800' :
                        integration.status === 'configured' ? 'bg-blue-100 text-blue-800' :
                        integration.status === 'installed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {integration.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                        Configure
                      </button>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Settings
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Integration Templates</h3>
              <p className="text-gray-600 mb-4">Pre-built integration templates coming soon</p>
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Request Template
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Modal */}
      {showInstallModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Install Integration</h3>
              <button
                onClick={() => setShowInstallModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{getProviderLogo(selectedIntegration.provider.id)}</span>
              <div>
                <h4 className="font-semibold text-gray-900">{selectedIntegration.name}</h4>
                <p className="text-sm text-gray-500">{selectedIntegration.provider.name}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">{selectedIntegration.description}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h5 className="font-medium text-gray-900 mb-2">What you'll get:</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                {selectedIntegration.capabilities.slice(0, 3).map((capability, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>{capability.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleInstall(selectedIntegration)}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Install Now
              </button>
              <button
                onClick={() => setShowInstallModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}