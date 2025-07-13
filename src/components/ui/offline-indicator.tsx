'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOfflineSupport, useNetworkStatus, useSyncStatus } from '../../hooks/useOfflineSupport';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  className?: string;
  showSyncStatus?: boolean;
  showNetworkInfo?: boolean;
}

export default function OfflineIndicator({ 
  position = 'top', 
  className = '',
  showSyncStatus = true,
  showNetworkInfo = false
}: OfflineIndicatorProps) {
  const { isOffline, isOnline, networkInfo } = useNetworkStatus();
  const { syncStatus, syncQueueLength, lastSyncTime, forceSync } = useSyncStatus();
  const [showDetails, setShowDetails] = useState(false);
  const [justCameOnline, setJustCameOnline] = useState(false);

  useEffect(() => {
    if (isOnline && justCameOnline) {
      // Auto-hide the "back online" message after 3 seconds
      const timer = setTimeout(() => setJustCameOnline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, justCameOnline]);

  useEffect(() => {
    // Detect when coming back online
    if (isOnline && !justCameOnline) {
      setJustCameOnline(true);
    }
  }, [isOnline, justCameOnline]);

  const getConnectionIcon = () => {
    if (isOffline) return '📴';
    
    switch (networkInfo.connectionType) {
      case 'wifi': return '📶';
      case 'cellular': return '📱';
      case 'ethernet': return '🌐';
      default: return '🔗';
    }
  };

  const getConnectionQuality = () => {
    if (isOffline) return 'offline';
    if (networkInfo.latency < 100) return 'excellent';
    if (networkInfo.latency < 300) return 'good';
    if (networkInfo.latency < 500) return 'fair';
    return 'poor';
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return '🔄';
      case 'error': return '⚠️';
      default: return syncQueueLength > 0 ? '⏳' : '✅';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const now = Date.now();
    const diff = now - lastSyncTime;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t';

  return (
    <AnimatePresence>
      {(isOffline || justCameOnline || (showSyncStatus && syncQueueLength > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'top' ? -50 : 50 }}
          className={`fixed left-0 right-0 z-50 ${positionClasses} ${className}`}
        >
          <div
            className={`px-4 py-2 text-sm font-medium text-center cursor-pointer transition-colors ${
              isOffline
                ? 'bg-red-500 text-white'
                : justCameOnline
                ? 'bg-green-500 text-white'
                : syncStatus === 'error'
                ? 'bg-yellow-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
            onClick={() => setShowDetails(!showDetails)}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{getConnectionIcon()}</span>
              <span>
                {isOffline
                  ? 'Working Offline'
                  : justCameOnline
                  ? 'Back Online - Syncing...'
                  : syncStatus === 'syncing'
                  ? 'Syncing...'
                  : syncQueueLength > 0
                  ? `${syncQueueLength} items to sync`
                  : 'All synced'
                }
              </span>
              {showSyncStatus && (
                <span>{getSyncStatusIcon()}</span>
              )}
            </div>
          </div>

          {/* Detailed Status Panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border-b border-gray-200 shadow-lg"
              >
                <div className="px-4 py-4 space-y-3">
                  {/* Network Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getConnectionIcon()}</span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {isOffline ? 'Offline' : 'Online'}
                        </div>
                        {showNetworkInfo && isOnline && (
                          <div className="text-xs text-gray-500">
                            {networkInfo.connectionType} • {getConnectionQuality()} • {networkInfo.latency}ms
                          </div>
                        )}
                      </div>
                    </div>
                    {isOnline && (
                      <button
                        onClick={() => forceSync()}
                        disabled={syncStatus === 'syncing'}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 disabled:opacity-50"
                      >
                        {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                      </button>
                    )}
                  </div>

                  {/* Sync Status */}
                  {showSyncStatus && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Sync Status</span>
                        <span className="text-lg">{getSyncStatusIcon()}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                        <div>
                          <div className="font-medium">Queue</div>
                          <div>{syncQueueLength} items</div>
                        </div>
                        <div>
                          <div className="font-medium">Last Sync</div>
                          <div>{formatLastSync()}</div>
                        </div>
                      </div>

                      {syncStatus === 'error' && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          ⚠️ Sync failed. Changes will be retried automatically.
                        </div>
                      )}

                      {isOffline && syncQueueLength > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                          💾 {syncQueueLength} changes saved locally. Will sync when online.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Connection Quality Indicator */}
                  {showNetworkInfo && isOnline && (
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Connection Quality</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              getConnectionQuality() === 'excellent' ? 'bg-green-500 w-full' :
                              getConnectionQuality() === 'good' ? 'bg-blue-500 w-3/4' :
                              getConnectionQuality() === 'fair' ? 'bg-yellow-500 w-1/2' :
                              'bg-red-500 w-1/4'
                            }`}
                          />
                        </div>
                        <span className="text-xs text-gray-600 capitalize">
                          {getConnectionQuality()}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                        <div>
                          <div className="font-medium">Type</div>
                          <div className="capitalize">{networkInfo.connectionType}</div>
                        </div>
                        <div>
                          <div className="font-medium">Latency</div>
                          <div>{networkInfo.latency}ms</div>
                        </div>
                        <div>
                          <div className="font-medium">Bandwidth</div>
                          <div>{networkInfo.bandwidth || 'Unknown'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="border-t border-gray-100 pt-3">
                    <div className="text-xs text-gray-500">
                      💡 {isOffline 
                        ? 'Your changes are saved locally and will sync when you\'re back online.'
                        : 'All features work offline. Changes sync automatically when connected.'
                      }
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simplified version for minimal display
export function OfflineStatus({ className = '' }: { className?: string }) {
  const { isOffline } = useNetworkStatus();
  const { syncQueueLength } = useSyncStatus();

  if (!isOffline && syncQueueLength === 0) return null;

  return (
    <div className={`flex items-center space-x-1 text-xs ${className}`}>
      {isOffline ? (
        <>
          <span className="text-red-500">📴</span>
          <span className="text-red-600">Offline</span>
        </>
      ) : syncQueueLength > 0 ? (
        <>
          <span className="text-blue-500">⏳</span>
          <span className="text-blue-600">{syncQueueLength} pending</span>
        </>
      ) : null}
    </div>
  );
}

// Network quality indicator component
export function NetworkQualityIndicator({ className = '' }: { className?: string }) {
  const { isOnline, networkInfo } = useNetworkStatus();

  if (!isOnline) return null;

  const getSignalBars = () => {
    if (networkInfo.latency < 100) return 4;
    if (networkInfo.latency < 300) return 3;
    if (networkInfo.latency < 500) return 2;
    return 1;
  };

  const signalBars = getSignalBars();

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4].map((bar) => (
        <div
          key={bar}
          className={`w-1 rounded-full ${
            bar <= signalBars 
              ? signalBars === 4 ? 'bg-green-500' :
                signalBars === 3 ? 'bg-blue-500' :
                signalBars === 2 ? 'bg-yellow-500' :
                'bg-red-500'
              : 'bg-gray-300'
          }`}
          style={{ height: `${bar * 3 + 2}px` }}
        />
      ))}
    </div>
  );
}