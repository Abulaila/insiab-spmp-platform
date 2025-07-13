'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRealTimeCollaboration } from '../../hooks/useRealTimeCollaboration';

interface CollaborativeEditorProps {
  entityType: 'project' | 'task' | 'portfolio' | 'document';
  entityId: string;
  fieldName: string;
  initialValue: string;
  placeholder?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  multiline?: boolean;
}

export default function CollaborativeEditor({
  entityType,
  entityId,
  fieldName,
  initialValue,
  placeholder = 'Start typing...',
  userId,
  userName,
  userAvatar,
  onSave,
  className = '',
  multiline = false
}: CollaborativeEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { currentEditors, sendEdit, recentEvents } = useRealTimeCollaboration({
    entityType,
    entityId,
    userId,
    userName,
    userAvatar,
    enableSelectionTracking: true
  });

  // Auto-save after user stops typing
  const debouncedSave = useCallback(
    (newValue: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        if (newValue !== initialValue) {
          setIsSaving(true);
          try {
            await onSave(newValue);
            setLastSaved(new Date());
            
            // Send collaboration event
            sendEdit(fieldName, initialValue, newValue, 'Auto-saved');
          } catch (error) {
            console.error('Failed to save:', error);
          } finally {
            setIsSaving(false);
          }
        }
      }, 1000); // Save 1 second after user stops typing
    },
    [initialValue, onSave, sendEdit, fieldName]
  );

  // Handle value changes
  const handleChange = (newValue: string) => {
    setValue(newValue);
    debouncedSave(newValue);
  };

  // Listen for real-time edits from other users
  useEffect(() => {
    const editEvents = recentEvents.filter(
      event => 
        event.type === 'edit' && 
        event.data.field === fieldName && 
        event.userId !== userId &&
        Date.now() - event.timestamp < 5000 // Only recent edits
    );

    if (editEvents.length > 0 && !isEditing) {
      const latestEdit = editEvents[0];
      setValue(latestEdit.data.newValue);
    }
  }, [recentEvents, fieldName, userId, isEditing]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const otherEditors = currentEditors.filter(editor => editor.id !== userId);
  const hasConflict = otherEditors.length > 0 && isEditing;

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={`relative ${className}`}>
      {/* Other editors indicator */}
      {otherEditors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-0 flex items-center space-x-2 z-10"
        >
          <div className="flex -space-x-1">
            {otherEditors.slice(0, 3).map((editor) => (
              <div
                key={editor.id}
                className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
                title={`${editor.name} is editing`}
              >
                {editor.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-xs text-blue-600 font-medium">
            {otherEditors.length === 1 
              ? `${otherEditors[0].name} is editing` 
              : `${otherEditors.length} people editing`
            }
          </span>
        </motion.div>
      )}

      {/* Editor */}
      <div className="relative">
        <InputComponent
          ref={inputRef as any}
          type={multiline ? undefined : 'text'}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            hasConflict ? 'border-amber-400 bg-amber-50' : ''
          } ${multiline ? 'resize-vertical min-h-[100px]' : ''}`}
          rows={multiline ? 4 : undefined}
        />

        {/* Saving indicator */}
        {(isSaving || saveTimeoutRef.current) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500">Saving...</span>
          </div>
        )}

        {/* Conflict warning */}
        {hasConflict && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-0 right-0 bg-amber-100 border border-amber-300 rounded-md p-2"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-amber-800">
                Multiple people are editing this field. Changes may conflict.
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Status footer */}
      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!isSaving && value !== initialValue && (
            <span className="text-amber-600">Unsaved changes</span>
          )}
          
          <span className="text-gray-400">
            Ctrl+Enter to save
          </span>
        </div>
      </div>
    </div>
  );
}