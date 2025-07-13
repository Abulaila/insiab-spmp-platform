'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MobileProjectDashboard from '../../components/mobile/MobileProjectDashboard';
import OfflineIndicator from '../../components/ui/offline-indicator';
import { useOfflineSupport } from '../../hooks/useOfflineSupport';

export default function MobilePage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'tasks' | 'analytics' | 'settings'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [offlineState, offlineActions] = useOfflineSupport();

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', color: 'blue' },
    { id: 'projects', label: 'Projects', icon: '📋', color: 'green' },
    { id: 'tasks', label: 'Tasks', icon: '✅', color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: '📊', color: 'orange' },
    { id: 'settings', label: 'Settings', icon: '⚙️', color: 'gray' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-3xl">🚀</span>
          </motion.div>
          
          <div className="text-white">
            <h1 className="text-3xl font-bold mb-2">ProjectOS Mobile</h1>
            <p className="text-blue-100">Loading your workspace...</p>
          </div>

          <motion.div
            className="w-48 h-2 bg-white/20 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const DashboardView = () => (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Good morning! 👋</h2>
              <p className="text-blue-100">Ready to tackle your projects?</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">12</div>
              <div className="text-xs text-blue-100">Active Projects</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">34</div>
              <div className="text-xs text-blue-100">Tasks Due</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-xl font-bold">89%</div>
              <div className="text-xs text-blue-100">On Track</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">➕</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">New Project</div>
              <div className="text-xs text-gray-500">Start something new</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Quick Task</div>
              <div className="text-xs text-gray-500">Add a task</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">📊</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">View Reports</div>
              <div className="text-xs text-gray-500">See progress</div>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => offlineActions.forceSync()}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-lg">🔄</span>
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Sync Data</div>
              <div className="text-xs text-gray-500">Update everything</div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { title: 'Website Redesign', action: 'Updated', time: '2 minutes ago', icon: '🎨' },
            { title: 'Mobile App Development', action: 'New task added', time: '15 minutes ago', icon: '📱' },
            { title: 'Marketing Campaign', action: 'Completed milestone', time: '1 hour ago', icon: '📢' },
          ].map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-lg">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{activity.title}</div>
                <div className="text-sm text-gray-600">{activity.action}</div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Offline Status Card */}
      {offlineState.isOffline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📱</span>
            <div>
              <div className="font-medium text-yellow-800">Working Offline</div>
              <div className="text-sm text-yellow-600">
                {offlineState.syncQueueLength} changes will sync when you&apos;re back online
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );

  const SettingsView = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      {/* Offline Management */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Offline & Sync</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Auto Sync</div>
              <div className="text-sm text-gray-600">Automatically sync when online</div>
            </div>
            <button className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Offline Storage</div>
              <div className="text-sm text-gray-600">{offlineState.offlineDataCount} items stored</div>
            </div>
            <button 
              onClick={() => offlineActions.clearAllData()}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm"
            >
              Clear
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Sync Queue</div>
              <div className="text-sm text-gray-600">{offlineState.syncQueueLength} pending</div>
            </div>
            <button 
              onClick={() => offlineActions.forceSync()}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm"
            >
              Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Export/Import */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-3">
          <button 
            onClick={async () => {
              const data = await offlineActions.exportData();
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'projectos-data.json';
              a.click();
            }}
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium"
          >
            📤 Export Offline Data
          </button>
          
          <input
            type="file"
            accept=".json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const text = await file.text();
                await offlineActions.importData(text);
              }
            }}
            className="hidden"
            id="import-data"
          />
          <label 
            htmlFor="import-data"
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium block text-center cursor-pointer"
          >
            📥 Import Data
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Indicator */}
      <OfflineIndicator 
        position="top" 
        showSyncStatus={true} 
        showNetworkInfo={true}
      />

      {/* Main Content */}
      <div className="pb-20 pt-16">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <DashboardView />
            </motion.div>
          )}
          
          {activeView === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <MobileProjectDashboard />
            </motion.div>
          )}
          
          {activeView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SettingsView />
            </motion.div>
          )}

          {(activeView === 'tasks' || activeView === 'analytics') && (
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 text-center py-20"
            >
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600">This feature is under development</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {activeView === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}