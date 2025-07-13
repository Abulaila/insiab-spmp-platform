'use client';

export interface CollaborationEvent {
  type: 'user_join' | 'user_leave' | 'cursor_move' | 'selection_change' | 'edit' | 'comment' | 'status_change';
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: number;
  data: any;
  entityType: 'project' | 'task' | 'portfolio' | 'document';
  entityId: string;
}

export interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: string;
  lastSeen: number;
  status: 'active' | 'idle' | 'away';
  currentView: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private presenceUsers = new Map<string, PresenceUser>();
  private eventListeners = new Map<string, Set<(event: CollaborationEvent) => void>>();
  private presenceListeners = new Set<(users: PresenceUser[]) => void>();

  constructor(private userId: string, private userName: string, private userAvatar?: string) {}

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      // Use secure WebSocket in production, regular WebSocket in development
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        // Send initial presence
        this.sendPresence();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.stopHeartbeat();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleMessage(data: any) {
    switch (data.type) {
      case 'presence_update':
        this.updatePresence(data.users);
        break;
      case 'collaboration_event':
        this.handleCollaborationEvent(data.event);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  private updatePresence(users: PresenceUser[]) {
    this.presenceUsers.clear();
    users.forEach(user => {
      this.presenceUsers.set(user.id, user);
    });
    
    this.presenceListeners.forEach(listener => {
      listener(Array.from(this.presenceUsers.values()));
    });
  }

  private handleCollaborationEvent(event: CollaborationEvent) {
    const listeners = this.eventListeners.get(event.entityId);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }

    // Also notify global listeners
    const globalListeners = this.eventListeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(listener => listener(event));
    }
  }

  // Public methods for sending events
  sendCollaborationEvent(event: Omit<CollaborationEvent, 'userId' | 'userName' | 'userAvatar' | 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const fullEvent: CollaborationEvent = {
        ...event,
        userId: this.userId,
        userName: this.userName,
        userAvatar: this.userAvatar,
        timestamp: Date.now()
      };

      this.ws.send(JSON.stringify({
        type: 'collaboration_event',
        event: fullEvent
      }));
    }
  }

  sendPresence(data?: Partial<PresenceUser>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'presence_update',
        user: {
          id: this.userId,
          name: this.userName,
          avatar: this.userAvatar,
          lastSeen: Date.now(),
          status: 'active',
          currentView: window.location.pathname,
          ...data
        }
      }));
    }
  }

  // Event subscription methods
  onCollaborationEvent(entityId: string, listener: (event: CollaborationEvent) => void) {
    if (!this.eventListeners.has(entityId)) {
      this.eventListeners.set(entityId, new Set());
    }
    this.eventListeners.get(entityId)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(entityId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.eventListeners.delete(entityId);
        }
      }
    };
  }

  onPresenceChange(listener: (users: PresenceUser[]) => void) {
    this.presenceListeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  // Utility methods
  getPresenceUsers(): PresenceUser[] {
    return Array.from(this.presenceUsers.values());
  }

  getUsersInView(viewPath: string): PresenceUser[] {
    return this.getPresenceUsers().filter(user => user.currentView === viewPath);
  }

  // Cursor tracking
  updateCursor(x: number, y: number) {
    this.sendPresence({ cursor: { x, y } });
  }

  // Selection tracking
  updateSelection(selectionId: string) {
    this.sendPresence({ selection: selectionId });
  }

  // Status updates
  updateStatus(status: 'active' | 'idle' | 'away') {
    this.sendPresence({ status });
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(userId?: string, userName?: string, userAvatar?: string): WebSocketManager {
  if (!wsManager && userId && userName) {
    wsManager = new WebSocketManager(userId, userName, userAvatar);
  }
  return wsManager!;
}

export function initializeWebSocket(userId: string, userName: string, userAvatar?: string): WebSocketManager {
  wsManager = new WebSocketManager(userId, userName, userAvatar);
  wsManager.connect();
  return wsManager;
}