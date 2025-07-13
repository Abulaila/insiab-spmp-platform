'use client';

import { useEffect, useRef, useState } from 'react';
import { CollaborationEvent, PresenceUser, getWebSocketManager } from '../lib/realtime/websocket-manager';

interface UseRealTimeCollaborationOptions {
  entityType: 'project' | 'task' | 'portfolio' | 'document';
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  enableCursorTracking?: boolean;
  enableSelectionTracking?: boolean;
}

export function useRealTimeCollaboration({
  entityType,
  entityId,
  userId,
  userName,
  userAvatar,
  enableCursorTracking = false,
  enableSelectionTracking = false
}: UseRealTimeCollaborationOptions) {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [recentEvents, setRecentEvents] = useState<CollaborationEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsManagerRef = useRef(getWebSocketManager(userId, userName, userAvatar));

  // Initialize WebSocket connection
  useEffect(() => {
    const wsManager = wsManagerRef.current;
    if (!wsManager) return;

    wsManager.connect();
    setIsConnected(true);

    // Clean up on unmount
    return () => {
      wsManager.disconnect();
      setIsConnected(false);
    };
  }, []);

  // Subscribe to presence updates
  useEffect(() => {
    const wsManager = wsManagerRef.current;
    if (!wsManager) return;

    const unsubscribePresence = wsManager.onPresenceChange((users) => {
      setPresenceUsers(users.filter(user => user.id !== userId));
    });

    return unsubscribePresence;
  }, [userId]);

  // Subscribe to collaboration events for this entity
  useEffect(() => {
    const wsManager = wsManagerRef.current;
    if (!wsManager) return;

    const unsubscribeEvents = wsManager.onCollaborationEvent(entityId, (event) => {
      setRecentEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    });

    return unsubscribeEvents;
  }, [entityId]);

  // Cursor tracking
  useEffect(() => {
    if (!enableCursorTracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      const wsManager = wsManagerRef.current;
      if (wsManager && isConnected) {
        wsManager.updateCursor(e.clientX, e.clientY);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [enableCursorTracking, isConnected]);

  // Selection tracking
  useEffect(() => {
    if (!enableSelectionTracking) return;

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const wsManager = wsManagerRef.current;
        if (wsManager && isConnected) {
          wsManager.updateSelection(selection.toString().substring(0, 50));
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [enableSelectionTracking, isConnected]);

  // Send collaboration events
  const sendCollaborationEvent = (
    type: CollaborationEvent['type'],
    data: any = {}
  ) => {
    const wsManager = wsManagerRef.current;
    if (wsManager && isConnected) {
      wsManager.sendCollaborationEvent({
        type,
        data,
        entityType,
        entityId
      });
    }
  };

  // Specific event methods
  const sendEdit = (field: string, oldValue: any, newValue: any, details?: string) => {
    sendCollaborationEvent('edit', {
      field,
      oldValue,
      newValue,
      details
    });
  };

  const sendComment = (content: string, targetId?: string) => {
    sendCollaborationEvent('comment', {
      content: content.substring(0, 100), // Truncate for performance
      targetId
    });
  };

  const sendStatusChange = (oldStatus: string, newStatus: string) => {
    sendCollaborationEvent('status_change', {
      oldStatus,
      newStatus
    });
  };

  const announcePresence = () => {
    const wsManager = wsManagerRef.current;
    if (wsManager && isConnected) {
      wsManager.sendCollaborationEvent({
        type: 'user_join',
        data: { entityType, entityId },
        entityType,
        entityId
      });
    }
  };

  const announceLeave = () => {
    const wsManager = wsManagerRef.current;
    if (wsManager && isConnected) {
      wsManager.sendCollaborationEvent({
        type: 'user_leave',
        data: { entityType, entityId },
        entityType,
        entityId
      });
    }
  };

  // Update user status
  const updateStatus = (status: 'active' | 'idle' | 'away') => {
    const wsManager = wsManagerRef.current;
    if (wsManager && isConnected) {
      wsManager.updateStatus(status);
    }
  };

  // Get users currently viewing this entity
  const getCurrentViewers = () => {
    return presenceUsers.filter(user => 
      user.currentView.includes(entityId) && user.status === 'active'
    );
  };

  // Get users currently editing
  const getCurrentEditors = () => {
    const recentEditEvents = recentEvents
      .filter(event => 
        event.type === 'edit' && 
        Date.now() - event.timestamp < 30000 // Last 30 seconds
      )
      .map(event => event.userId);
    
    return presenceUsers.filter(user => recentEditEvents.includes(user.id));
  };

  return {
    // State
    presenceUsers,
    recentEvents,
    isConnected,
    currentViewers: getCurrentViewers(),
    currentEditors: getCurrentEditors(),

    // Actions
    sendEdit,
    sendComment,
    sendStatusChange,
    announcePresence,
    announceLeave,
    updateStatus,

    // Utilities
    sendCollaborationEvent,
    wsManager: wsManagerRef.current
  };
}