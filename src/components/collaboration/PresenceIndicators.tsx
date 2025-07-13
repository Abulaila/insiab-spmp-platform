'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PresenceUser, getWebSocketManager } from '../../lib/realtime/websocket-manager';

interface PresenceIndicatorsProps {
  entityId?: string;
  maxVisible?: number;
  showCursors?: boolean;
  className?: string;
}

export default function PresenceIndicators({ 
  entityId, 
  maxVisible = 5, 
  showCursors = false,
  className = '' 
}: PresenceIndicatorsProps) {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const wsManager = getWebSocketManager();
    if (!wsManager) return;

    const unsubscribe = wsManager.onPresenceChange((users) => {
      // Filter users based on current view if entityId is provided
      const filteredUsers = entityId 
        ? users.filter(user => user.currentView.includes(entityId))
        : users;
      
      setPresenceUsers(filteredUsers.filter(user => user.status === 'active'));
      
      // Update cursors if enabled
      if (showCursors) {
        const newCursors = new Map();
        filteredUsers.forEach(user => {
          if (user.cursor) {
            newCursors.set(user.id, user.cursor);
          }
        });
        setCursors(newCursors);
      }
    });

    return unsubscribe;
  }, [entityId, showCursors]);

  const visibleUsers = presenceUsers.slice(0, maxVisible);
  const overflowCount = Math.max(0, presenceUsers.length - maxVisible);

  const getUserInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <>
      {/* Presence Avatars */}
      <div className={`flex items-center space-x-2 ${className}`}>
        <AnimatePresence>
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                    {getUserInitials(user.name)}
                  </div>
                )}
                
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-gray-300 capitalize">{user.status}</div>
                  {user.selection && (
                    <div className="text-blue-300 text-xs">Editing: {user.selection}</div>
                  )}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 text-xs font-medium"
          >
            +{overflowCount}
          </motion.div>
        )}

        {/* Live indicator */}
        {presenceUsers.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>{presenceUsers.length} online</span>
          </div>
        )}
      </div>

      {/* Live Cursors */}
      {showCursors && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <AnimatePresence>
            {Array.from(cursors.entries()).map(([userId, cursor]) => {
              const user = presenceUsers.find(u => u.id === userId);
              if (!user || !cursor) return null;

              return (
                <motion.div
                  key={userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    left: cursor.x,
                    top: cursor.y,
                    transform: 'translate(-2px, -2px)'
                  }}
                  className="absolute"
                >
                  {/* Cursor */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="text-blue-500"
                  >
                    <path
                      d="M2 2L7 17L9 10L17 8L2 2Z"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth="2"
                    />
                  </svg>
                  
                  {/* User label */}
                  <div className="ml-4 mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    {user.name}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}