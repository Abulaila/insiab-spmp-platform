'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollaborationEvent, getWebSocketManager } from '../../lib/realtime/websocket-manager';

interface RealTimeActivityFeedProps {
  entityId?: string;
  maxItems?: number;
  showTimestamps?: boolean;
  className?: string;
}

export default function RealTimeActivityFeed({
  entityId = '*',
  maxItems = 10,
  showTimestamps = true,
  className = ''
}: RealTimeActivityFeedProps) {
  const [activities, setActivities] = useState<CollaborationEvent[]>([]);

  useEffect(() => {
    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    const unsubscribe = wsManager.onCollaborationEvent(entityId, (event) => {
      setActivities(prev => {
        const newActivities = [event, ...prev].slice(0, maxItems);
        return newActivities;
      });
    });

    return unsubscribe;
  }, [entityId, maxItems]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_join':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'user_leave':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        );
      case 'edit':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'comment':
        return (
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'status_change':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getActivityMessage = (event: CollaborationEvent) => {
    switch (event.type) {
      case 'user_join':
        return `${event.userName} joined the ${event.entityType}`;
      case 'user_leave':
        return `${event.userName} left the ${event.entityType}`;
      case 'edit':
        return `${event.userName} edited ${event.data.field || 'content'}`;
      case 'comment':
        return `${event.userName} added a comment`;
      case 'status_change':
        return `${event.userName} changed status to ${event.data.newStatus}`;
      case 'cursor_move':
        return `${event.userName} is viewing this area`;
      case 'selection_change':
        return `${event.userName} selected ${event.data.selection}`;
      default:
        return `${event.userName} performed an action`;
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_join': return 'border-l-green-500 bg-green-50';
      case 'user_leave': return 'border-l-gray-400 bg-gray-50';
      case 'edit': return 'border-l-blue-500 bg-blue-50';
      case 'comment': return 'border-l-purple-500 bg-purple-50';
      case 'status_change': return 'border-l-orange-500 bg-orange-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (activities.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-medium text-gray-900">Live Activity</h3>
        </div>
        <div className="text-center py-8 text-gray-500 text-sm">
          <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          No recent activity
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-medium text-gray-900">Live Activity</h3>
        </div>
        <span className="text-xs text-gray-500">{activities.length} recent</span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence initial={false}>
          {activities.map((activity, index) => (
            <motion.div
              key={`${activity.timestamp}-${activity.userId}-${index}`}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`border-l-3 pl-3 py-2 rounded-r-md ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    {getActivityMessage(activity)}
                  </p>
                  {showTimestamps && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(activity.timestamp)}
                    </p>
                  )}
                  {activity.data.details && (
                    <p className="text-xs text-gray-600 mt-1 italic">
                      {activity.data.details}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {activities.length >= maxItems && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            View all activity →
          </button>
        </div>
      )}
    </div>
  );
}