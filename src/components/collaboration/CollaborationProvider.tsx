'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { initializeWebSocket, WebSocketManager } from '../../lib/realtime/websocket-manager';

interface CollaborationContextType {
  wsManager: WebSocketManager | null;
  isConnected: boolean;
}

const CollaborationContext = createContext<CollaborationContextType>({
  wsManager: null,
  isConnected: false
});

interface CollaborationProviderProps {
  children: ReactNode;
  userId: string;
  userName: string;
  userAvatar?: string;
}

export function CollaborationProvider({ 
  children, 
  userId, 
  userName, 
  userAvatar 
}: CollaborationProviderProps) {
  useEffect(() => {
    // Initialize WebSocket connection
    const wsManager = initializeWebSocket(userId, userName, userAvatar);
    
    return () => {
      wsManager.disconnect();
    };
  }, [userId, userName, userAvatar]);

  return (
    <CollaborationContext.Provider value={{ 
      wsManager: null, // Will be set by individual components
      isConnected: false 
    }}>
      {children}
    </CollaborationContext.Provider>
  );
}

export function useCollaboration() {
  return useContext(CollaborationContext);
}