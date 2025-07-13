'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealTimeCollaboration } from '../../hooks/useRealTimeCollaboration';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  isEditing?: boolean;
  replyToId?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

interface CollaborativeCommentsProps {
  entityType: 'project' | 'task' | 'portfolio' | 'document';
  entityId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  className?: string;
}

export default function CollaborativeComments({
  entityType,
  entityId,
  userId,
  userName,
  userAvatar,
  className = ''
}: CollaborativeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const { sendComment, recentEvents, currentViewers } = useRealTimeCollaboration({
    entityType,
    entityId,
    userId,
    userName,
    userAvatar
  });

  // Load existing comments
  useEffect(() => {
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/${entityType}s/${entityId}/comments`);
        if (response.ok) {
          const commentsData = await response.json();
          setComments(commentsData);
        }
      } catch (error) {
        console.error('Failed to load comments:', error);
      }
    };

    loadComments();
  }, [entityType, entityId]);

  // Listen for real-time comment events
  useEffect(() => {
    const commentEvents = recentEvents.filter(event => event.type === 'comment');
    commentEvents.forEach(event => {
      if (event.userId !== userId) {
        // Add comment from other user
        const newComment: Comment = {
          id: `temp-${Date.now()}-${event.userId}`,
          content: event.data.content,
          authorId: event.userId,
          authorName: event.userName,
          authorAvatar: event.userAvatar,
          createdAt: new Date(event.timestamp).toISOString()
        };
        setComments(prev => [newComment, ...prev]);
      }
    });
  }, [recentEvents, userId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Send to API
      const response = await fetch(`/api/${entityType}s/${entityId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          replyToId
        })
      });

      if (response.ok) {
        const comment = await response.json();
        setComments(prev => [comment, ...prev]);
        
        // Send real-time event
        sendComment(newComment, replyToId || undefined);
        
        setNewComment('');
        setReplyToId(null);
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/${entityType}s/${entityId}/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId ? updatedComment : comment
          )
        );
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getAuthorInitials = (name: string) => {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const isAuthorOnline = (authorId: string) => {
    return currentViewers.some(viewer => viewer.id === authorId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({comments.length})
          </h3>
          {currentViewers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{currentViewers.length} viewing</span>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input */}
      <div className="p-4 border-b border-gray-200">
        {replyToId && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md flex items-center justify-between">
            <span className="text-sm text-blue-700">
              Replying to comment
            </span>
            <button
              onClick={() => setReplyToId(null)}
              className="text-blue-500 hover:text-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                {getAuthorInitials(userName)}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSubmitComment();
                }
              }}
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                Ctrl+Enter to submit
              </span>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 relative">
                      {comment.authorAvatar ? (
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {getAuthorInitials(comment.authorName)}
                        </div>
                      )}
                      
                      {isAuthorOnline(comment.authorId) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {comment.authorName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                        {isAuthorOnline(comment.authorId) && (
                          <span className="text-xs text-green-600 font-medium">online</span>
                        )}
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-700">{comment.content}</p>
                      
                      {/* Comment Actions */}
                      <div className="mt-2 flex items-center space-x-4">
                        <button
                          onClick={() => setReplyToId(comment.id)}
                          className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          Reply
                        </button>
                        
                        {/* Quick Reactions */}
                        <div className="flex items-center space-x-1">
                          {['👍', '❤️', '😊', '🎉'].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(comment.id, emoji)}
                              className="text-sm hover:bg-gray-200 rounded px-1 py-0.5 transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        
                        {/* Show reactions */}
                        {comment.reactions && comment.reactions.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {comment.reactions.map((reaction, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 rounded-full px-2 py-1 flex items-center space-x-1"
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-gray-600">{reaction.count}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}