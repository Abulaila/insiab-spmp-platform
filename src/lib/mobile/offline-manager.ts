'use client';

export interface OfflineData {
  id: string;
  type: 'project' | 'task' | 'resource' | 'analytics' | 'risk' | 'integration';
  data: any;
  timestamp: number;
  version: number;
  syncStatus: 'pending' | 'synced' | 'conflict' | 'error';
  lastModified: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface OfflineConfig {
  maxStorageSize: number; // in MB
  syncInterval: number; // in ms
  maxRetries: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  autoSync: boolean;
  conflictResolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
}

export interface NetworkInfo {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  bandwidth: number; // in Mbps
  latency: number; // in ms
  lastChecked: number;
}

export class OfflineManager {
  private config: OfflineConfig;
  private syncQueue: SyncQueueItem[] = [];
  private offlineData: Map<string, OfflineData> = new Map();
  private networkInfo: NetworkInfo;
  private syncInProgress = false;
  private eventListeners: { [event: string]: Function[] } = {};

  constructor(config?: Partial<OfflineConfig>) {
    this.config = {
      maxStorageSize: 50, // 50MB default
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      compressionEnabled: true,
      encryptionEnabled: true,
      autoSync: true,
      conflictResolution: 'merge',
      ...config
    };

    this.networkInfo = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: 'unknown',
      bandwidth: 0,
      latency: 0,
      lastChecked: Date.now()
    };

    this.initializeOfflineSupport();
  }

  private initializeOfflineSupport() {
    if (typeof window === 'undefined') return;

    // Load existing offline data
    this.loadOfflineData();
    this.loadSyncQueue();

    // Set up network monitoring
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Monitor connection quality
    this.monitorConnectionQuality();

    // Set up periodic sync
    if (this.config.autoSync) {
      setInterval(() => this.performSync(), this.config.syncInterval);
    }

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.networkInfo.isOnline) {
        this.performSync();
      }
    });
  }

  // Network Management
  private handleNetworkChange(isOnline: boolean) {
    this.networkInfo.isOnline = isOnline;
    this.networkInfo.lastChecked = Date.now();
    
    this.emit('networkChange', { isOnline, networkInfo: this.networkInfo });

    if (isOnline) {
      this.emit('connectionRestored');
      this.performSync();
    } else {
      this.emit('connectionLost');
    }
  }

  private async monitorConnectionQuality() {
    if (!this.networkInfo.isOnline) return;

    try {
      const startTime = performance.now();
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = performance.now();

      if (response.ok) {
        this.networkInfo.latency = endTime - startTime;
        this.updateConnectionType();
      }
    } catch (error) {
      this.networkInfo.latency = -1; // Connection failed
    }

    this.networkInfo.lastChecked = Date.now();
  }

  private updateConnectionType() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkInfo.connectionType = connection.effectiveType || 'unknown';
      this.networkInfo.bandwidth = connection.downlink || 0;
    }
  }

  // Data Storage Management
  public async storeOffline(type: string, id: string, data: any): Promise<void> {
    const offlineItem: OfflineData = {
      id: `${type}_${id}`,
      type: type as any,
      data: this.config.compressionEnabled ? this.compressData(data) : data,
      timestamp: Date.now(),
      version: 1,
      syncStatus: 'pending',
      lastModified: Date.now()
    };

    // Check storage limits
    if (await this.isStorageLimitExceeded()) {
      await this.cleanupOldData();
    }

    this.offlineData.set(offlineItem.id, offlineItem);
    await this.persistOfflineData();

    this.emit('dataStored', { type, id, data });
  }

  public async retrieveOffline(type: string, id?: string): Promise<any> {
    if (id) {
      const item = this.offlineData.get(`${type}_${id}`);
      if (item) {
        const data = this.config.compressionEnabled ? 
          this.decompressData(item.data) : item.data;
        return data;
      }
      return null;
    }

    // Return all items of type
    const items: any[] = [];
    for (const [key, item] of this.offlineData) {
      if (item.type === type) {
        const data = this.config.compressionEnabled ? 
          this.decompressData(item.data) : item.data;
        items.push(data);
      }
    }
    return items;
  }

  public async deleteOffline(type: string, id: string): Promise<void> {
    const key = `${type}_${id}`;
    this.offlineData.delete(key);
    await this.persistOfflineData();

    this.emit('dataDeleted', { type, id });
  }

  // Sync Queue Management
  public addToSyncQueue(operation: 'create' | 'update' | 'delete', type: string, data: any, priority: SyncQueueItem['priority'] = 'medium') {
    const queueItem: SyncQueueItem = {
      id: `${type}_${data.id || Date.now()}`,
      operation,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    // Insert based on priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const insertIndex = this.syncQueue.findIndex(item => 
      priorityOrder[item.priority] > priorityOrder[priority]
    );

    if (insertIndex === -1) {
      this.syncQueue.push(queueItem);
    } else {
      this.syncQueue.splice(insertIndex, 0, queueItem);
    }

    this.persistSyncQueue();
    this.emit('queueUpdated', { queueLength: this.syncQueue.length });

    // Trigger immediate sync for critical items
    if (priority === 'critical' && this.networkInfo.isOnline) {
      this.performSync();
    }
  }

  public async performSync(force = false): Promise<void> {
    if (!this.networkInfo.isOnline && !force) return;
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    this.emit('syncStarted');

    try {
      let syncedCount = 0;
      let failedCount = 0;

      // Process sync queue
      for (let i = this.syncQueue.length - 1; i >= 0; i--) {
        const item = this.syncQueue[i];
        
        try {
          await this.syncQueueItem(item);
          this.syncQueue.splice(i, 1);
          syncedCount++;
        } catch (error) {
          item.retryCount++;
          if (item.retryCount >= this.config.maxRetries) {
            this.syncQueue.splice(i, 1);
            this.emit('syncItemFailed', { item, error });
          }
          failedCount++;
        }
      }

      // Sync offline data with server
      await this.syncOfflineData();

      await this.persistSyncQueue();
      
      this.emit('syncCompleted', { 
        syncedCount, 
        failedCount, 
        remainingItems: this.syncQueue.length 
      });

    } catch (error) {
      this.emit('syncError', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncQueueItem(item: SyncQueueItem): Promise<void> {
    const endpoint = `/api/v1/${item.type}`;
    let response: Response;

    switch (item.operation) {
      case 'create':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;

      case 'update':
        response = await fetch(`${endpoint}/${item.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data)
        });
        break;

      case 'delete':
        response = await fetch(`${endpoint}/${item.data.id}`, {
          method: 'DELETE'
        });
        break;

      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status} ${response.statusText}`);
    }
  }

  private async syncOfflineData(): Promise<void> {
    // Check for server updates and handle conflicts
    for (const [key, item] of this.offlineData) {
      if (item.syncStatus === 'synced') continue;

      try {
        const serverData = await this.fetchServerData(item.type, item.id);
        
        if (serverData) {
          const conflict = this.detectConflict(item, serverData);
          if (conflict) {
            await this.resolveConflict(item, serverData);
          } else {
            item.syncStatus = 'synced';
          }
        }
      } catch (error) {
        item.syncStatus = 'error';
        console.error(`Failed to sync ${key}:`, error);
      }
    }

    await this.persistOfflineData();
  }

  // Conflict Resolution
  private detectConflict(localItem: OfflineData, serverData: any): boolean {
    return serverData.lastModified > localItem.lastModified;
  }

  private async resolveConflict(localItem: OfflineData, serverData: any): Promise<void> {
    const localData = this.config.compressionEnabled ? 
      this.decompressData(localItem.data) : localItem.data;

    switch (this.config.conflictResolution) {
      case 'client_wins':
        // Keep local version, push to server
        await this.pushToServer(localItem);
        break;

      case 'server_wins':
        // Use server version
        localItem.data = this.config.compressionEnabled ? 
          this.compressData(serverData) : serverData;
        localItem.syncStatus = 'synced';
        localItem.lastModified = serverData.lastModified;
        break;

      case 'merge':
        // Attempt to merge changes
        const mergedData = this.mergeData(localData, serverData);
        localItem.data = this.config.compressionEnabled ? 
          this.compressData(mergedData) : mergedData;
        await this.pushToServer(localItem);
        break;

      case 'manual':
        // Mark for manual resolution
        localItem.syncStatus = 'conflict';
        this.emit('conflictDetected', { localData, serverData, itemId: localItem.id });
        break;
    }
  }

  private mergeData(localData: any, serverData: any): any {
    // Simple merge strategy - in production, this would be more sophisticated
    return {
      ...serverData,
      ...localData,
      lastModified: Math.max(localData.lastModified || 0, serverData.lastModified || 0)
    };
  }

  private async pushToServer(item: OfflineData): Promise<void> {
    const data = this.config.compressionEnabled ? 
      this.decompressData(item.data) : item.data;

    const response = await fetch(`/api/v1/${item.type}/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      item.syncStatus = 'synced';
    } else {
      throw new Error(`Failed to push ${item.id} to server`);
    }
  }

  private async fetchServerData(type: string, id: string): Promise<any> {
    const response = await fetch(`/api/v1/${type}/${id.split('_')[1]}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  }

  // Storage Management
  private async isStorageLimitExceeded(): Promise<boolean> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage || 0) / (1024 * 1024);
      return usedMB > this.config.maxStorageSize;
    }
    return false;
  }

  private async cleanupOldData(): Promise<void> {
    const sortedItems = Array.from(this.offlineData.values())
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest 25% of items
    const toRemove = Math.floor(sortedItems.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.offlineData.delete(sortedItems[i].id);
    }

    await this.persistOfflineData();
    this.emit('dataCleanup', { removedCount: toRemove });
  }

  // Data Compression
  private compressData(data: any): string {
    return JSON.stringify(data); // In production, use actual compression
  }

  private decompressData(compressedData: string): any {
    return JSON.parse(compressedData); // In production, use actual decompression
  }

  // Persistence
  private async persistOfflineData(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    
    const dataArray = Array.from(this.offlineData.entries());
    localStorage.setItem('offline_data', JSON.stringify(dataArray));
  }

  private loadOfflineData(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('offline_data');
      if (stored) {
        const dataArray = JSON.parse(stored);
        this.offlineData = new Map(dataArray);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private async persistSyncQueue(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
  }

  private loadSyncQueue(): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  // Event System
  public on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  public off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event]
        .filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Public API
  public getNetworkInfo(): NetworkInfo {
    return { ...this.networkInfo };
  }

  public getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  public getOfflineDataCount(): number {
    return this.offlineData.size;
  }

  public async forcSync(): Promise<void> {
    await this.performSync(true);
  }

  public clearAllOfflineData(): void {
    this.offlineData.clear();
    this.syncQueue = [];
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('offline_data');
      localStorage.removeItem('sync_queue');
    }
    this.emit('dataCleared');
  }

  public async exportOfflineData(): Promise<string> {
    const exportData = {
      offlineData: Array.from(this.offlineData.entries()),
      syncQueue: this.syncQueue,
      config: this.config,
      timestamp: Date.now()
    };
    return JSON.stringify(exportData, null, 2);
  }

  public async importOfflineData(importData: string): Promise<void> {
    try {
      const data = JSON.parse(importData);
      this.offlineData = new Map(data.offlineData);
      this.syncQueue = data.syncQueue || [];
      await this.persistOfflineData();
      await this.persistSyncQueue();
      this.emit('dataImported');
    } catch (error) {
      throw new Error('Failed to import offline data: Invalid format');
    }
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();