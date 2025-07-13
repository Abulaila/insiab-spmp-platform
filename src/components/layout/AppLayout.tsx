'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import CommandPalette from '../search/CommandPalette';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { ProjectWithTeamMembers } from '../../lib/database';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [projects, setProjects] = useState<ProjectWithTeamMembers[]>([]);
  const { isOpen, openCommandPalette, closeCommandPalette } = useCommandPalette();

  // Load projects for command palette - OPTIMIZED WITH TIMEOUT
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch('/api/projects', {
          signal: controller.signal
        });
        if (response.ok) {
          const projectsData = await response.json();
          setProjects(projectsData);
        }
        clearTimeout(timeoutId);
      } catch (error) {
        console.warn('Failed to load projects for command palette:', error);
        // Continue without projects data - command palette will still work
      }
    };

    loadProjects();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onExpandedChange={setSidebarExpanded}
      />

      {/* Main content area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        sidebarExpanded ? 'lg:ml-72' : 'lg:ml-16'
      }`}>
        {/* Top Navigation */}
        <TopNavigation
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
          onSearchClick={openCommandPalette}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isOpen}
        onClose={closeCommandPalette}
        projects={projects}
      />
    </div>
  );
}