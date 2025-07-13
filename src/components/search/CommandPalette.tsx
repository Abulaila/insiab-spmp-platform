'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      description: 'Navigate to the main dashboard',
      category: 'Navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        </svg>
      ),
      action: () => router.push('/'),
      keywords: ['home', 'main', 'overview']
    },
    {
      id: 'projects',
      name: 'View Projects',
      description: 'Navigate to projects management',
      category: 'Navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      action: () => router.push('/projects'),
      keywords: ['work', 'manage']
    },
    {
      id: 'new-project',
      name: 'Create New Project',
      description: 'Start a new project',
      category: 'Actions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      action: () => router.push('/projects?action=new'),
      keywords: ['add', 'start', 'begin']
    },
    {
      id: 'tasks',
      name: 'View Tasks',
      description: 'Navigate to task management',
      category: 'Navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      action: () => router.push('/tasks'),
      keywords: ['todo', 'work', 'assignments']
    },
    {
      id: 'portfolios',
      name: 'View Portfolios',
      description: 'Navigate to portfolio management',
      category: 'Navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      action: () => router.push('/portfolios'),
      keywords: ['collection', 'group']
    },
    {
      id: 'analytics',
      name: 'View Analytics',
      description: 'Navigate to analytics dashboard',
      category: 'Navigation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      action: () => router.push('/analytics'),
      keywords: ['reports', 'data', 'insights', 'metrics']
    },
    {
      id: 'search-projects',
      name: 'Search Projects',
      description: 'Find specific projects',
      category: 'Search',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      action: () => router.push('/projects?search=true'),
      keywords: ['find', 'locate', 'filter']
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      description: 'Access administrative features',
      category: 'Admin',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => router.push('/admin'),
      keywords: ['settings', 'config', 'manage', 'system']
    }
  ];

  const filteredCommands = commands.filter(command => {
    if (!query) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      command.name.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.category.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.includes(searchTerm))
    );
  });

  const executeCommand = useCallback((command: Command) => {
    command.action();
    onClose();
    setQuery('');
    setSelectedIndex(0);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, executeCommand, onClose]);

  if (!isOpen) return null;

  const groupedCommands = filteredCommands.reduce((groups, command) => {
    const category = command.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(command);
    return groups;
  }, {} as Record<string, Command[]>);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative mt-16 w-full max-w-2xl transform overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
          <div className="relative">
            {/* Search Input */}
            <div className="flex items-center px-4 py-4">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for commands, projects, or navigate..."
                className="w-full bg-transparent text-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-0 focus:outline-none"
              />
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <kbd className="px-2 py-1 bg-gray-100 rounded">↵</kbd>
                <span>to select</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded">↑↓</kbd>
                <span>to navigate</span>
              </div>
            </div>

            {/* Results */}
            <div 
              ref={listRef}
              className="max-h-96 overflow-y-auto border-t border-gray-100"
            >
              {Object.keys(groupedCommands).length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm">Try searching for projects, tasks, or navigation commands</p>
                </div>
              ) : (
                Object.entries(groupedCommands).map(([category, commands]) => (
                  <div key={category} className="py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wide">
                      {category}
                    </div>
                    {commands.map((command, commandIndex) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={command.id}
                          onClick={() => executeCommand(command)}
                          className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                          }`}
                        >
                          <div className={`flex-shrink-0 mr-3 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {command.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.name}</div>
                            <div className="text-sm text-gray-500">{command.description}</div>
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 ml-3">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {filteredCommands.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>{filteredCommands.length} command{filteredCommands.length !== 1 ? 's' : ''} available</span>
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center">
                      <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs">Esc</kbd>
                      <span className="ml-1">to close</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}