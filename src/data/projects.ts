export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  methodology: 'agile' | 'waterfall' | 'hybrid';
  status: 'active' | 'completed' | 'on-hold' | 'blocked';
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100
  startDate: string;
  dueDate: string;
  budget: number;
  teamMembers: TeamMember[];
  tags: string[];
  lastUpdated: string;
  createdBy: string;
}

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Sarah Chen', avatar: '👩‍💻', role: 'Project Manager', email: 'sarah@projectos.com' },
  { id: '2', name: 'Alex Rodriguez', avatar: '👨‍💼', role: 'Tech Lead', email: 'alex@projectos.com' },
  { id: '3', name: 'Emily Johnson', avatar: '👩‍🎨', role: 'UI/UX Designer', email: 'emily@projectos.com' },
  { id: '4', name: 'Michael Kim', avatar: '👨‍💻', role: 'Frontend Developer', email: 'michael@projectos.com' },
  { id: '5', name: 'Jessica Wu', avatar: '👩‍🔬', role: 'Data Scientist', email: 'jessica@projectos.com' },
  { id: '6', name: 'David Thompson', avatar: '👨‍🔧', role: 'DevOps Engineer', email: 'david@projectos.com' },
  { id: '7', name: 'Lisa Park', avatar: '👩‍💼', role: 'Business Analyst', email: 'lisa@projectos.com' },
  { id: '8', name: 'James Wilson', avatar: '👨‍🎯', role: 'QA Engineer', email: 'james@projectos.com' },
];

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'ProjectOS 2.0 Platform',
    description: 'Enterprise intelligence platform development with AI-powered analytics',
    methodology: 'agile',
    status: 'active',
    priority: 'high',
    progress: 87,
    startDate: '2025-01-15',
    dueDate: '2025-07-25',
    budget: 450000,
    teamMembers: [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]],
    tags: ['Enterprise', 'AI', 'Analytics', 'Platform'],
    lastUpdated: '2025-07-10',
    createdBy: 'Sarah Chen'
  },
  {
    id: 'proj-002',
    name: 'AI Analytics Engine',
    description: 'Machine learning integration for predictive insights and automated reporting',
    methodology: 'hybrid',
    status: 'active',
    priority: 'high',
    progress: 62,
    startDate: '2025-03-01',
    dueDate: '2025-08-15',
    budget: 320000,
    teamMembers: [teamMembers[4], teamMembers[1], teamMembers[5]],
    tags: ['AI', 'Machine Learning', 'Analytics', 'Automation'],
    lastUpdated: '2025-07-09',
    createdBy: 'Alex Rodriguez'
  },
  {
    id: 'proj-003',
    name: 'Enterprise Dashboard',
    description: 'Executive KPI visualization and real-time reporting system',
    methodology: 'waterfall',
    status: 'active',
    priority: 'medium',
    progress: 34,
    startDate: '2025-04-01',
    dueDate: '2025-09-01',
    budget: 180000,
    teamMembers: [teamMembers[2], teamMembers[3], teamMembers[6]],
    tags: ['Dashboard', 'KPI', 'Visualization', 'Reporting'],
    lastUpdated: '2025-07-08',
    createdBy: 'Emily Johnson'
  },
  {
    id: 'proj-004',
    name: 'Mobile App Redesign',
    description: 'Complete overhaul of mobile application with modern UI/UX',
    methodology: 'agile',
    status: 'active',
    priority: 'medium',
    progress: 45,
    startDate: '2025-02-15',
    dueDate: '2025-08-30',
    budget: 150000,
    teamMembers: [teamMembers[2], teamMembers[3], teamMembers[7]],
    tags: ['Mobile', 'UI/UX', 'Redesign', 'App'],
    lastUpdated: '2025-07-11',
    createdBy: 'Emily Johnson'
  },
  {
    id: 'proj-005',
    name: 'Security Infrastructure',
    description: 'Implementation of enterprise-grade security measures and compliance',
    methodology: 'waterfall',
    status: 'on-hold',
    priority: 'high',
    progress: 23,
    startDate: '2025-01-01',
    dueDate: '2025-10-15',
    budget: 275000,
    teamMembers: [teamMembers[5], teamMembers[7], teamMembers[0]],
    tags: ['Security', 'Compliance', 'Infrastructure', 'Enterprise'],
    lastUpdated: '2025-07-05',
    createdBy: 'David Thompson'
  },
  {
    id: 'proj-006',
    name: 'Customer Portal',
    description: 'Self-service customer portal with advanced features',
    methodology: 'hybrid',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    startDate: '2024-10-01',
    dueDate: '2025-03-15',
    budget: 120000,
    teamMembers: [teamMembers[3], teamMembers[6], teamMembers[7]],
    tags: ['Portal', 'Customer', 'Self-service', 'Web'],
    lastUpdated: '2025-03-15',
    createdBy: 'Lisa Park'
  },
  {
    id: 'proj-007',
    name: 'API Integration Hub',
    description: 'Centralized API management and integration platform',
    methodology: 'agile',
    status: 'blocked',
    priority: 'high',
    progress: 78,
    startDate: '2025-02-01',
    dueDate: '2025-07-30',
    budget: 200000,
    teamMembers: [teamMembers[1], teamMembers[5], teamMembers[3]],
    tags: ['API', 'Integration', 'Platform', 'Backend'],
    lastUpdated: '2025-07-07',
    createdBy: 'Alex Rodriguez'
  },
  {
    id: 'proj-008',
    name: 'Data Warehouse Migration',
    description: 'Migration of legacy data systems to modern cloud infrastructure',
    methodology: 'waterfall',
    status: 'active',
    priority: 'medium',
    progress: 56,
    startDate: '2025-03-15',
    dueDate: '2025-09-30',
    budget: 380000,
    teamMembers: [teamMembers[4], teamMembers[5], teamMembers[0]],
    tags: ['Data', 'Migration', 'Cloud', 'Infrastructure'],
    lastUpdated: '2025-07-10',
    createdBy: 'Jessica Wu'
  },
  {
    id: 'proj-009',
    name: 'Automation Framework',
    description: 'Enterprise automation framework for business processes',
    methodology: 'hybrid',
    status: 'active',
    priority: 'low',
    progress: 29,
    startDate: '2025-05-01',
    dueDate: '2025-11-15',
    budget: 95000,
    teamMembers: [teamMembers[5], teamMembers[7], teamMembers[1]],
    tags: ['Automation', 'Framework', 'Process', 'Efficiency'],
    lastUpdated: '2025-07-09',
    createdBy: 'David Thompson'
  },
  {
    id: 'proj-010',
    name: 'Performance Optimization',
    description: 'System-wide performance improvements and optimization',
    methodology: 'agile',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    startDate: '2024-11-01',
    dueDate: '2025-04-30',
    budget: 85000,
    teamMembers: [teamMembers[1], teamMembers[5], teamMembers[7]],
    tags: ['Performance', 'Optimization', 'System', 'Speed'],
    lastUpdated: '2025-04-30',
    createdBy: 'Alex Rodriguez'
  }
];

export const getProjectsByMethodology = (methodology: string) => {
  if (methodology === 'all') return mockProjects;
  return mockProjects.filter(project => project.methodology === methodology);
};

export const getProjectsByStatus = (status: string) => {
  return mockProjects.filter(project => project.status === status);
};

export const getProjectStats = () => {
  const total = mockProjects.length;
  const active = mockProjects.filter(p => p.status === 'active').length;
  const completed = mockProjects.filter(p => p.status === 'completed').length;
  const blocked = mockProjects.filter(p => p.status === 'blocked').length;
  const onHold = mockProjects.filter(p => p.status === 'on-hold').length;

  const agileProjects = mockProjects.filter(p => p.methodology === 'agile').length;
  const waterfallProjects = mockProjects.filter(p => p.methodology === 'waterfall').length;
  const hybridProjects = mockProjects.filter(p => p.methodology === 'hybrid').length;

  const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);
  const avgProgress = Math.round(mockProjects.reduce((sum, p) => sum + p.progress, 0) / total);

  return {
    total,
    active,
    completed,
    blocked,
    onHold,
    agileProjects,
    waterfallProjects,
    hybridProjects,
    totalBudget,
    avgProgress
  };
};