'use client';

import { useState, useEffect, useCallback } from 'react';
import { offlineManager, OfflineData, SyncQueueItem, NetworkInfo } from '../lib/mobile/offline-manager';

export interface OfflineState {
  isOffline: boolean;
  isOnline: boolean;
  networkInfo: NetworkInfo;
  syncQueueLength: number;
  offlineDataCount: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncTime?: number;
}

export interface OfflineActions {
  storeOffline: (type: string, id: string, data: any) => Promise<void>;
  retrieveOffline: (type: string, id?: string) => Promise<any>;
  deleteOffline: (type: string, id: string) => Promise<void>;
  addToSyncQueue: (operation: 'create' | 'update' | 'delete', type: string, data: any, priority?: 'low' | 'medium' | 'high' | 'critical') => void;
  forceSync: () => Promise<void>;
  clearAllData: () => void;
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
}

export function useOfflineSupport(): [OfflineState, OfflineActions] {
  const [state, setState] = useState<OfflineState>({
    isOffline: false,
    isOnline: true,
    networkInfo: offlineManager.getNetworkInfo(),
    syncQueueLength: offlineManager.getSyncQueueLength(),
    offlineDataCount: offlineManager.getOfflineDataCount(),
    syncStatus: 'idle',
    lastSyncTime: undefined
  });

  const updateState = useCallback(() => {
    setState(prev => ({
      ...prev,
      networkInfo: offlineManager.getNetworkInfo(),
      syncQueueLength: offlineManager.getSyncQueueLength(),
      offlineDataCount: offlineManager.getOfflineDataCount(),
      isOffline: !offlineManager.getNetworkInfo().isOnline,
      isOnline: offlineManager.getNetworkInfo().isOnline
    }));
  }, []);

  useEffect(() => {
    // Initial state update
    updateState();

    // Event listeners
    const handleNetworkChange = (data: { isOnline: boolean; networkInfo: NetworkInfo }) => {
      setState(prev => ({
        ...prev,
        isOffline: !data.isOnline,
        isOnline: data.isOnline,
        networkInfo: data.networkInfo
      }));
    };

    const handleSyncStarted = () => {
      setState(prev => ({ ...prev, syncStatus: 'syncing' }));
    };

    const handleSyncCompleted = (data: { syncedCount: number; failedCount: number; remainingItems: number }) => {
      setState(prev => ({
        ...prev,
        syncStatus: 'idle',
        lastSyncTime: Date.now(),
        syncQueueLength: data.remainingItems
      }));
    };

    const handleSyncError = () => {
      setState(prev => ({ ...prev, syncStatus: 'error' }));
    };

    const handleQueueUpdated = (data: { queueLength: number }) => {
      setState(prev => ({ ...prev, syncQueueLength: data.queueLength }));
    };

    const handleDataStored = () => {
      updateState();
    };

    const handleDataDeleted = () => {
      updateState();
    };

    const handleDataCleared = () => {
      updateState();
    };

    // Register event listeners
    offlineManager.on('networkChange', handleNetworkChange);
    offlineManager.on('syncStarted', handleSyncStarted);
    offlineManager.on('syncCompleted', handleSyncCompleted);
    offlineManager.on('syncError', handleSyncError);
    offlineManager.on('queueUpdated', handleQueueUpdated);
    offlineManager.on('dataStored', handleDataStored);
    offlineManager.on('dataDeleted', handleDataDeleted);
    offlineManager.on('dataCleared', handleDataCleared);

    // Cleanup
    return () => {
      offlineManager.off('networkChange', handleNetworkChange);
      offlineManager.off('syncStarted', handleSyncStarted);
      offlineManager.off('syncCompleted', handleSyncCompleted);
      offlineManager.off('syncError', handleSyncError);
      offlineManager.off('queueUpdated', handleQueueUpdated);
      offlineManager.off('dataStored', handleDataStored);
      offlineManager.off('dataDeleted', handleDataDeleted);
      offlineManager.off('dataCleared', handleDataCleared);
    };
  }, [updateState]);

  const actions: OfflineActions = {
    storeOffline: async (type: string, id: string, data: any) => {
      await offlineManager.storeOffline(type, id, data);
      updateState();
    },

    retrieveOffline: async (type: string, id?: string) => {
      return await offlineManager.retrieveOffline(type, id);
    },

    deleteOffline: async (type: string, id: string) => {
      await offlineManager.deleteOffline(type, id);
      updateState();
    },

    addToSyncQueue: (operation: 'create' | 'update' | 'delete', type: string, data: any, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
      offlineManager.addToSyncQueue(operation, type, data, priority);
      updateState();
    },

    forceSync: async () => {
      await offlineManager.forcSync();
      updateState();
    },

    clearAllData: () => {
      offlineManager.clearAllOfflineData();
      updateState();
    },

    exportData: async () => {
      return await offlineManager.exportOfflineData();
    },

    importData: async (data: string) => {
      await offlineManager.importOfflineData(data);
      updateState();
    }
  };

  return [state, actions];
}

// Additional utility hooks
export function useNetworkStatus() {
  const [state] = useOfflineSupport();
  return {
    isOnline: state.isOnline,
    isOffline: state.isOffline,
    networkInfo: state.networkInfo
  };
}

export function useSyncStatus() {
  const [state, actions] = useOfflineSupport();
  return {
    syncStatus: state.syncStatus,
    syncQueueLength: state.syncQueueLength,
    lastSyncTime: state.lastSyncTime,
    forceSync: actions.forceSync
  };
}

export function useOfflineData<T = any>(type: string, id?: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, actions] = useOfflineSupport();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await actions.retrieveOffline(type, id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load offline data');
    } finally {
      setLoading(false);
    }
  }, [type, id, actions]);

  const saveData = useCallback(async (newData: T, dataId?: string) => {
    try {
      const targetId = dataId || id || 'default';
      await actions.storeOffline(type, targetId, newData);
      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offline data');
    }
  }, [type, id, actions]);

  const deleteData = useCallback(async (dataId?: string) => {
    try {
      const targetId = dataId || id;
      if (!targetId) throw new Error('No ID provided for deletion');
      await actions.deleteOffline(type, targetId);
      setData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offline data');
    }
  }, [type, id, actions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    saveData,
    deleteData,
    reloadData: loadData
  };
}

// Hook for optimistic updates with offline support
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>,
  options?: {
    onError?: (error: Error, rollbackData: T) => void;
    syncPriority?: 'low' | 'medium' | 'high' | 'critical';
  }
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [, actions] = useOfflineSupport();

  const update = useCallback(async (newData: T) => {
    const previousData = data;
    
    try {
      setIsUpdating(true);
      // Optimistically update UI
      setData(newData);

      // Try to update on server
      if (navigator.onLine) {
        const result = await updateFn(newData);
        setData(result);
      } else {
        // Add to sync queue for later
        actions.addToSyncQueue(
          'update', 
          'optimistic_update', 
          newData, 
          options?.syncPriority || 'medium'
        );
      }
    } catch (error) {
      // Rollback on error
      setData(previousData);
      options?.onError?.(error as Error, previousData);
      
      // Add to sync queue to retry later
      actions.addToSyncQueue(
        'update', 
        'optimistic_update', 
        newData, 
        options?.syncPriority || 'medium'
      );
    } finally {
      setIsUpdating(false);
    }
  }, [data, updateFn, actions, options]);

  return {
    data,
    isUpdating,
    update
  };
}