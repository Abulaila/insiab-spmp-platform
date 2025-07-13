'use client';

import { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface ProjectCardProps {
  project: any;
  index: number;
  onProjectClick?: (project: any) => void;
  isDragging?: boolean;
}

const PRIORITY_COLORS = {
  high: 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-900/20',
  medium: 'border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/20',
  low: 'border-l-emerald-500 bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20'
};

const METHODOLOGY_COLORS = {
  agile: 'bg-gradient-to-r from-blue-500 to-indigo-600',
  waterfall: 'bg-gradient-to-r from-purple-500 to-violet-600',
  hybrid: 'bg-gradient-to-r from-orange-500 to-pink-600'
};

const METHODOLOGY_ICONS = {
  agile: '⚡',
  waterfall: '🌊',
  hybrid: '🔄'
};

const STATUS_INDICATORS = {
  active: { color: 'text-emerald-600 dark:text-emerald-400', icon: '●' },
  on_hold: { color: 'text-amber-600 dark:text-amber-400', icon: '⏸' },
  blocked: { color: 'text-red-600 dark:text-red-400', icon: '⚠' },
  completed: { color: 'text-blue-600 dark:text-blue-400', icon: '✓' }
};

export function ProjectCard({ project, index, onProjectClick, isDragging = false }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const isOverdue = new Date(project.dueDate) < new Date();
  const isDueSoon = !isOverdue && 
    new Date(project.dueDate).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-emerald-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-indigo-600';
    if (progress >= 25) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => {
        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border-l-4 border-r border-t border-b border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
              PRIORITY_COLORS[project.priority]
            } ${
              snapshot.isDragging 
                ? 'rotate-2 shadow-2xl scale-105 ring-2 ring-blue-500/50 z-50' 
                : 'hover:scale-[1.02] hover:-translate-y-1'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onProjectClick?.(project)}
          >
            {/* Top Section: Header with Status & Priority */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span 
                    className={`text-lg ${STATUS_INDICATORS[project.status]?.color || 'text-slate-500'}`}
                    title={project.status.replace('_', ' ').toUpperCase()}
                  >
                    {STATUS_INDICATORS[project.status]?.icon || '●'}
                  </span>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold text-white ${METHODOLOGY_COLORS[project.methodology]}`}>
                    <span className="mr-1">{METHODOLOGY_ICONS[project.methodology]}</span>
                    {project.methodology.toUpperCase()}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOverdue && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full">
                      OVERDUE
                    </span>
                  )}
                  {isDueSoon && !isOverdue && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                      DUE SOON
                    </span>
                  )}
                </div>
              </div>

              {/* Project Title */}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>

              {/* Description */}
              <p className={`text-sm text-slate-600 dark:text-slate-400 leading-relaxed ${
                showFullDescription ? '' : 'line-clamp-2'
              }`}>
                {project.description}
              </p>
              
              {project.description.length > 100 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDescription(!showFullDescription);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                >
                  {showFullDescription ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>

            {/* Progress Section */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Progress
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {project.progress}%
                </span>
              </div>
              
              <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor(project.progress)} rounded-full transition-all duration-500 shadow-sm`}
                  style={{ width: `${project.progress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Details Grid */}
            <div className="px-5 pb-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Budget</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Due Date</span>
                  <span className={`font-bold ${
                    isOverdue 
                      ? 'text-red-600 dark:text-red-400' 
                      : isDueSoon 
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {formatDate(project.dueDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="px-5 pb-3">
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-full font-medium"
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs rounded-full">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Team Section */}
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Team:</span>
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map((member: any, idx: number) => (
                      <div
                        key={member.user.id}
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800 shadow-sm hover:scale-110 transition-transform"
                        title={`${member.user.name} - ${member.user.role}`}
                      >
                        {member.user.avatar || member.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="w-8 h-8 bg-slate-400 dark:bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800">
                        +{project.teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {project.teamMembers.length} member{project.teamMembers.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Hover Overlay */}
            {isHovered && !snapshot.isDragging && (
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-transparent rounded-2xl pointer-events-none" />
            )}

            {/* Drag Indicator */}
            {snapshot.isDragging && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
}