'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { SortConfig } from '../../../app/projects/page';
import { ProjectWithTeamMembers } from '../../../lib/database';

interface ProjectNetworkViewProps {
  projects: ProjectWithTeamMembers[];
  selectedProjects: string[];
  setSelectedProjects: (ids: string[]) => void;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  project: ProjectWithTeamMembers;
  radius: number;
  group: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: NetworkNode | string;
  target: NetworkNode | string;
  strength: number;
  type: 'team' | 'methodology' | 'timeline' | 'dependency';
  value: number;
}

export default function ProjectNetworkView({
  projects,
  selectedProjects,
  setSelectedProjects,
  sortConfig,
  setSortConfig
}: ProjectNetworkViewProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'team' | 'methodology' | 'timeline' | 'dependency'>('team');
  const [layoutType, setLayoutType] = useState<'force' | 'circular' | 'hierarchical' | 'grid'>('circular'); // Default to circular for better performance
  const [simulationStrength, setSimulationStrength] = useState(0.2); // Reduced default strength
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [nodeLimit, setNodeLimit] = useState(50); // Performance: Limit initial nodes
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const dimensions = { width: 1200, height: 800 };

  // Performance monitoring
  const isLargeDataset = projects.length > 100;
  const performanceMode = projects.length > 50;

  // Generate network data with performance optimizations
  const networkData = useMemo(() => {
    console.time('NetworkData Generation');
    
    // Performance: Limit nodes for better rendering
    const limitedProjects = projects.slice(0, nodeLimit);
    
    // Show performance warning if needed
    if (projects.length > 100 && !showPerformanceWarning) {
      setShowPerformanceWarning(true);
    }

    // Create nodes with simplified radius calculation
    const nodes: NetworkNode[] = limitedProjects.map((project) => {
      const radius = performanceMode ? 
        Math.max(6, Math.min(15, project.teamMembers.length * 2)) : // Simplified for performance
        Math.max(8, Math.min(25, project.teamMembers.length * 4 + project.progress / 4));
      
      return {
        id: project.id,
        project,
        radius,
        group: project.status,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
      };
    });

    // Generate links with early exits and filtering
    const links: NetworkLink[] = [];
    const minStrength = performanceMode ? 0.3 : 0.1; // Higher threshold for performance
    const maxLinks = performanceMode ? 200 : 500; // Limit total links
    
    // Performance: Reduce complexity for large datasets
    const projectsToProcess = limitedProjects;
    
    for (let i = 0; i < projectsToProcess.length; i++) {
      if (links.length >= maxLinks) break; // Early exit for performance
      
      for (let j = i + 1; j < projectsToProcess.length; j++) {
        const projectA = projectsToProcess[i];
        const projectB = projectsToProcess[j];
        let strength = 0;
        let type: 'team' | 'methodology' | 'timeline' | 'dependency' = 'team';

        switch (viewMode) {
          case 'team':
            // Performance: Quick check before expensive filter
            if (projectA.teamMembers.length === 0 || projectB.teamMembers.length === 0) break;
            
            const sharedMembers = projectA.teamMembers.filter(memberA =>
              projectB.teamMembers.some(memberB => memberA.user.id === memberB.user.id)
            );
            strength = sharedMembers.length / Math.max(projectA.teamMembers.length, projectB.teamMembers.length);
            type = 'team';
            break;

          case 'methodology':
            if (projectA.methodology === projectB.methodology) {
              strength = 1;
              type = 'methodology';
            }
            break;

          case 'timeline':
            const startA = new Date(projectA.startDate);
            const endA = new Date(projectA.dueDate);
            const startB = new Date(projectB.startDate);
            const endB = new Date(projectB.dueDate);
            
            const overlap = Math.min(endA.getTime(), endB.getTime()) - Math.max(startA.getTime(), startB.getTime());
            if (overlap > 0) {
              strength = Math.min(overlap / (1000 * 60 * 60 * 24 * 30), 1);
              type = 'timeline';
            }
            break;

          case 'dependency':
            // Performance: Simplified dependency calculation
            const sharedTeam = projectA.teamMembers.length > 0 && projectB.teamMembers.length > 0 &&
              projectA.teamMembers.some(memberA => 
                projectB.teamMembers.some(memberB => memberA.user.id === memberB.user.id)
              );
            
            if (sharedTeam) {
              strength = 0.5;
              type = 'dependency';
            }
            break;
        }

        // Performance: Only add links above minimum strength
        if (strength >= minStrength) {
          links.push({
            source: projectA.id,
            target: projectB.id,
            strength,
            type,
            value: strength,
          });
        }
      }
    }

    console.timeEnd('NetworkData Generation');
    console.log(`Generated ${nodes.length} nodes and ${links.length} links`);
    
    return { nodes, links };
  }, [projects, viewMode, dimensions, nodeLimit, performanceMode]);

  // EMERGENCY FIX: Disabled D3 Force Simulation for server stability
  const setupSimulation = useCallback(() => {
    if (!svgRef.current || !networkData.nodes.length) return;

    console.log('EMERGENCY MODE: Using static layout only (D3 simulation disabled)');

    // Clear previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Apply static positioning based on layout type
    if (layoutType === 'circular') {
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      networkData.nodes.forEach((node, i) => {
        const angle = (i / networkData.nodes.length) * 2 * Math.PI;
        node.x = dimensions.width / 2 + Math.cos(angle) * radius;
        node.y = dimensions.height / 2 + Math.sin(angle) * radius;
        node.fx = node.x;
        node.fy = node.y;
      });
    } else if (layoutType === 'grid') {
      const cols = Math.ceil(Math.sqrt(networkData.nodes.length));
      const rows = Math.ceil(networkData.nodes.length / cols);
      const cellWidth = dimensions.width / cols;
      const cellHeight = dimensions.height / rows;
      
      networkData.nodes.forEach((node, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        node.x = (col + 0.5) * cellWidth;
        node.y = (row + 0.5) * cellHeight;
        node.fx = node.x;
        node.fy = node.y;
      });
    } else {
      // Default to circular for other layouts
      const radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      networkData.nodes.forEach((node, i) => {
        const angle = (i / networkData.nodes.length) * 2 * Math.PI;
        node.x = dimensions.width / 2 + Math.cos(angle) * radius;
        node.y = dimensions.height / 2 + Math.sin(angle) * radius;
        node.fx = node.x;
        node.fy = node.y;
      });
    }

    // Create minimal simulation that doesn't run
    const simulation = d3.forceSimulation<NetworkNode>(networkData.nodes)
      .stop(); // Immediately stop to prevent performance issues

    simulationRef.current = simulation;
    setIsSimulationRunning(false);

    console.log('Static layout applied successfully');

  }, [networkData, layoutType, dimensions]);

  // Initialize D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Create main container group
    const container = svg.append('g').attr('class', 'network-container');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Create links
    container.selectAll('.link')
      .data(networkData.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => {
        switch (d.type) {
          case 'team': return '#3b82f6';
          case 'methodology': return '#10b981';
          case 'timeline': return '#f59e0b';
          case 'dependency': return '#ef4444';
          default: return '#6b7280';
        }
      })
      .attr('stroke-width', d => Math.max(1, d.strength * 5))
      .attr('stroke-opacity', d => Math.min(0.8, d.strength + 0.2))
      .style('pointer-events', 'none');

    // Create nodes
    const nodeGroups = container.selectAll('.node-group')
      .data(networkData.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    // Add node circles
    nodeGroups.append('circle')
      .attr('class', 'node')
      .attr('r', d => d.radius)
      .attr('fill', d => getNodeColor(d.project))
      .attr('stroke', d => selectedProjects.includes(d.id) ? '#fff' : 'none')
      .attr('stroke-width', d => selectedProjects.includes(d.id) ? 3 : 0)
      .on('click', (event, d) => {
        event.stopPropagation();
        handleNodeClick(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d.id);
        d3.select(event.currentTarget).attr('stroke', '#fff').attr('stroke-width', 2);
      })
      .on('mouseleave', (event, d) => {
        setHoveredNode(null);
        const isSelected = selectedProjects.includes(d.id);
        d3.select(event.currentTarget)
          .attr('stroke', isSelected ? '#fff' : 'none')
          .attr('stroke-width', isSelected ? 3 : 0);
      });

    // Add node labels
    nodeGroups.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '10px')
      .style('font-weight', '500')
      .style('fill', '#374151')
      .style('pointer-events', 'none')
      .text(d => d.project.name.length > 12 ? d.project.name.substring(0, 10) + '...' : d.project.name);

    // Setup drag behavior
    const drag = d3.drag<SVGGElement, NetworkNode>()
      .on('start', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active && simulationRef.current) {
          simulationRef.current.alphaTarget(0);
        }
        if (layoutType === 'force') {
          d.fx = null;
          d.fy = null;
        }
      });

    nodeGroups.call(drag);

    setupSimulation();

    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, [networkData.nodes.length, selectedProjects.length, layoutType]); // EMERGENCY FIX: Removed setupSimulation to prevent infinite loop

  const getNodeColor = (project: ProjectWithTeamMembers) => {
    switch (project.status) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'on_hold': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (selectedProjects.includes(nodeId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== nodeId));
      setSelectedNode(null);
    } else {
      setSelectedProjects([...selectedProjects, nodeId]);
      setSelectedNode(nodeId);
    }
  };

  const restartSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
      setIsSimulationRunning(true);
    }
  };

  const centerNetwork = () => {
    if (zoomRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    }
  };

  return (
    <div className="p-6">
      {/* Network Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced Project Network
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Interactive visualization of {projects.length} projects with {networkData.links.length} connections
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('team')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                viewMode === 'team'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setViewMode('methodology')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'methodology'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Method
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('dependency')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                viewMode === 'dependency'
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Dependencies
            </button>
          </div>

          {/* Layout Type Selector */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setLayoutType('force')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                layoutType === 'force'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Force
            </button>
            <button
              onClick={() => setLayoutType('circular')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                layoutType === 'circular'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Circle
            </button>
            <button
              onClick={() => setLayoutType('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                layoutType === 'grid'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Grid
            </button>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={restartSimulation}
              disabled={isSimulationRunning}
              className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSimulationRunning ? (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running</span>
                </div>
              ) : (
                'Restart'
              )}
            </button>
            <button
              onClick={centerNetwork}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Center
            </button>
          </div>
        </div>
      </div>

      {/* Performance Warning */}
      {showPerformanceWarning && (
        <div className="mb-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Large Dataset Detected ({projects.length} projects)
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Showing {nodeLimit} nodes for optimal performance. Increase limit below if needed.
              </p>
            </div>
            <button
              onClick={() => setShowPerformanceWarning(false)}
              className="flex-shrink-0 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Emergency Mode Warning */}
      <div className="mb-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Emergency Mode Active
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              D3 force simulation disabled for server stability. Using static layouts only.
            </p>
          </div>
        </div>
      </div>

      {/* Performance & Simulation Controls */}
      <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Performance Settings</h4>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                Node Limit:
              </span>
              <input
                type="range"
                min="25"
                max={Math.min(projects.length, 200)}
                step="25"
                value={nodeLimit}
                onChange={(e) => setNodeLimit(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                {nodeLimit}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                Force Strength:
              </span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={simulationStrength}
                onChange={(e) => setSimulationStrength(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-0">
                {simulationStrength.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Usage Tips</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>• Mouse wheel: Zoom in/out</div>
              <div>• Drag nodes: Reposition manually</div>
              <div>• Click nodes: Select/deselect</div>
              <div>• Lower node limit for better performance</div>
              <div>• Use circular layout for large datasets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Network Visualization */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full border-b border-gray-100 dark:border-gray-800"
            style={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 50%)' }}
          >
            {/* Background pattern for better visual appeal */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="1" fill="rgba(107, 114, 128, 0.1)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Zoom indicator */}
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
            Zoom to explore • Double-click to focus
          </div>
        </div>
      </div>

      {/* Advanced Network Analytics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{projects.length}</div>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Total Projects</div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Active network nodes</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{networkData.links.length}</div>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-green-700 dark:text-green-300 font-medium">Active Links</div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">Project relationships</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {Math.round((networkData.links.length / Math.max(projects.length - 1, 1)) * 100)}%
            </div>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">Network Density</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Connectivity ratio</div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-700 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{selectedProjects.length}</div>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300 font-medium">Selected Nodes</div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">Focus projects</div>
        </motion.div>
      </div>

      {/* Enhanced Legend & Instructions */}
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Network Guide & Legend
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Node Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Node Properties
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Status Colors</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Active, Complete, Hold, Blocked</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Node Size</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Based on team size & progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Types */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <div className="w-3 h-1 bg-blue-500 mr-2"></div>
              Link Types
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-1 bg-blue-500 rounded"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Team Links</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Shared team members</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-1 bg-green-500 rounded"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Methodology</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Same approach</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-1 bg-yellow-500 rounded"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Timeline</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Overlapping dates</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-1 bg-red-500 rounded"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Dependencies</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Critical connections</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction Guide */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
              <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              Interactions
            </h4>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white mb-1">Mouse Actions</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Click: Select/deselect nodes</div>
                  <div>• Drag: Reposition nodes</div>
                  <div>• Wheel: Zoom in/out</div>
                  <div>• Hover: Highlight connections</div>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white mb-1">Layouts</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <div>• Force: Physics simulation</div>
                  <div>• Circle: Radial arrangement</div>
                  <div>• Grid: Organized matrix</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Project Details */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-6"
        >
          {(() => {
            const project = projects.find(p => p.id === selectedNode);
            if (!project) return null;

            const connectedProjects = networkData.links
              .filter(link => 
                (link.source as NetworkNode).id === selectedNode || 
                (link.target as NetworkNode).id === selectedNode
              )
              .map(link => {
                const connectedId = (link.source as NetworkNode).id === selectedNode 
                  ? (link.target as NetworkNode).id 
                  : (link.source as NetworkNode).id;
                return projects.find(p => p.id === connectedId);
              })
              .filter(Boolean);

            return (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: getNodeColor(project) }}
                    ></div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {project.status.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Methodology</div>
                    <div className="font-semibold text-gray-900 dark:text-white capitalize">
                      {project.methodology}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Progress</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {project.progress}%
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Team Size</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {project.teamMembers.length} members
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project Details</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Description</div>
                        <div className="text-sm text-gray-900 dark:text-white mt-1">
                          {project.description}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${project.budget.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Priority</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {project.priority}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Connected Projects ({connectedProjects.length})
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {connectedProjects.length > 0 ? (
                        connectedProjects.map((connectedProject) => (
                          <div 
                            key={connectedProject!.id} 
                            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => handleNodeClick(connectedProject!.id)}
                          >
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: getNodeColor(connectedProject!) }}
                            ></div>
                            <div className="text-sm text-gray-900 dark:text-white truncate">
                              {connectedProject!.name}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No connected projects in current view
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}