'use client';

import { useState } from 'react';

interface InsiabLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'horizontal';
  className?: string;
  animated?: boolean;
  theme?: 'light' | 'dark';
}


const logoSizes = {
  xs: { container: 'w-6 h-6', svg: 'w-6 h-6' },
  sm: { container: 'w-8 h-8', svg: 'w-8 h-8' },
  md: { container: 'w-12 h-12', svg: 'w-12 h-12' },
  lg: { container: 'w-16 h-16', svg: 'w-16 h-16' },
  xl: { container: 'w-24 h-24', svg: 'w-24 h-24' }
};

export default function InsiabLogo({ 
  size = 'md', 
  variant = 'icon', 
  className = '', 
  animated = true,
  theme = 'light'
}: InsiabLogoProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const logoSize = logoSizes[size];
  const isDark = theme === 'dark';
  
  // Define gradient colors based on theme
  const gradientId = `insiab-gradient-${theme}-${size}`;
  const flowGradientId = `flow-gradient-${theme}-${size}`;
  
  const IconLogo = () => (
    <div 
      className={`${logoSize.container} ${className} relative group cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg 
        className={`${logoSize.svg} transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`}
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#60a5fa" : "#3b82f6"} />
            <stop offset="50%" stopColor={isDark ? "#3b82f6" : "#2563eb"} />
            <stop offset="100%" stopColor={isDark ? "#2563eb" : "#1d4ed8"} />
          </linearGradient>
          
          <linearGradient id={flowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor={isDark ? "#60a5fa" : "#3b82f6"} stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
            {animated && (
              <animateTransform
                attributeName="gradientTransform"
                attributeType="XML"
                values="translate(-100 0); translate(100 0); translate(-100 0)"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </linearGradient>
          
          {/* Glow effect */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main infinity circuit path */}
        <path
          d="M20 50 Q35 25 50 50 Q65 75 80 50"
          stroke={`url(#${gradientId})`}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          filter={isHovered ? "url(#glow)" : undefined}
          className="transition-all duration-300"
        />
        
        {/* Secondary circuit paths */}
        <path
          d="M15 45 Q30 30 45 45 Q60 60 75 45"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        <path
          d="M25 55 Q40 40 55 55 Q70 70 85 55"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        
        {/* Circuit nodes */}
        <circle cx="20" cy="50" r="2" fill={`url(#${gradientId})`} className={animated ? "animate-pulse" : ""} />
        <circle cx="35" cy="37.5" r="1.5" fill={`url(#${gradientId})`} className={animated ? "animate-pulse" : ""} style={{animationDelay: "0.5s"}} />
        <circle cx="50" cy="50" r="2.5" fill={`url(#${gradientId})`} className={animated ? "animate-pulse" : ""} style={{animationDelay: "1s"}} />
        <circle cx="65" cy="62.5" r="1.5" fill={`url(#${gradientId})`} className={animated ? "animate-pulse" : ""} style={{animationDelay: "1.5s"}} />
        <circle cx="80" cy="50" r="2" fill={`url(#${gradientId})`} className={animated ? "animate-pulse" : ""} style={{animationDelay: "2s"}} />
        
        {/* Additional small nodes */}
        <circle cx="30" cy="52" r="1" fill={`url(#${gradientId})`} opacity="0.7" />
        <circle cx="70" cy="48" r="1" fill={`url(#${gradientId})`} opacity="0.7" />
        <circle cx="42" cy="43" r="0.8" fill={`url(#${gradientId})`} opacity="0.5" />
        <circle cx="58" cy="57" r="0.8" fill={`url(#${gradientId})`} opacity="0.5" />
        
        {/* Flowing data effect */}
        {animated && (
          <circle r="1.5" fill={`url(#${flowGradientId})`}>
            <animateMotion dur="4s" repeatCount="indefinite">
              <path d="M20 50 Q35 25 50 50 Q65 75 80 50" />
            </animateMotion>
          </circle>
        )}
      </svg>
      
      {/* Hover glow effect */}
      {isHovered && (
        <div className={`absolute inset-0 ${logoSize.container} rounded-lg bg-blue-500 opacity-20 blur-xl -z-10`} />
      )}
    </div>
  );
  
  const FullLogo = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <IconLogo />
      <div className="flex flex-col">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
          Insiab
        </h1>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
          by DeepShift
        </p>
      </div>
    </div>
  );
  
  const HorizontalLogo = () => (
    <div className={`flex items-center space-x-4 ${className}`}>
      <IconLogo />
      <div className="flex flex-col">
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} tracking-tight`}>
          Insiab
        </h1>
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} font-medium`}>
          The AI OS that powers your business for now and next
        </p>
      </div>
    </div>
  );
  
  switch (variant) {
    case 'full':
      return <FullLogo />;
    case 'horizontal':
      return <HorizontalLogo />;
    default:
      return <IconLogo />;
  }
}