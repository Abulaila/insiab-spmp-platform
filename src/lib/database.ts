import { prisma } from './prisma';
import { ProjectMethodology, ProjectStatus, Priority } from '@prisma/client';

// Type aliases for programs (same values as projects)
export type ProgramStatus = ProjectStatus;
export type ProgramMethodology = ProjectMethodology;
export type ProgramPriority = Priority;

// Type aliases for portfolios (same values as projects)
export type PortfolioStatus = ProjectStatus;
export type PortfolioMethodology = ProjectMethodology;
export type PortfolioPriority = Priority;

export interface ProjectWithTeamMembers {
  id: string;
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  startDate: Date;
  dueDate: Date;
  budget: number;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
  teamMembers: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      role: string;
    };
  }[];
  tags: {
    tag: string;
  }[];
}

export interface CreateProjectInput {
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: ProjectStatus;
  priority: Priority;
  progress?: number;
  startDate: Date;
  dueDate: Date;
  budget: number;
  createdBy: string;
  teamMemberIds: string[];
  tags: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  methodology?: ProjectMethodology;
  status?: ProjectStatus;
  priority?: Priority;
  progress?: number;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  teamMemberIds?: string[];
  tags?: string[];
}

// Program interfaces (similar to Project interfaces)
export interface ProgramWithTeamMembers {
  id: string;
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: ProgramStatus;
  priority: Priority;
  progress: number;
  startDate: Date;
  dueDate: Date;
  budget: number;
  lastUpdated: Date;
  createdAt: Date;
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
  teamMembers: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      role: string;
    };
  }[];
  tags: {
    tag: string;
  }[];
}

export interface CreateProgramInput {
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: ProgramStatus;
  priority: Priority;
  progress?: number;
  startDate: Date;
  dueDate: Date;
  budget: number;
  createdBy: string;
  teamMemberIds: string[];
  tags: string[];
}

export interface UpdateProgramInput {
  name?: string;
  description?: string;
  methodology?: ProjectMethodology;
  status?: ProgramStatus;
  priority?: Priority;
  progress?: number;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  teamMemberIds?: string[];
  tags?: string[];
}

// Project operations
export async function getAllProjects(): Promise<ProjectWithTeamMembers[]> {
  return await prisma.project.findMany({
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function getProjectById(id: string): Promise<ProjectWithTeamMembers | null> {
  return await prisma.project.findUnique({
    where: { id },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });
}

export async function getProjectsByMethodology(methodology: ProjectMethodology): Promise<ProjectWithTeamMembers[]> {
  return await prisma.project.findMany({
    where: { methodology },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<ProjectWithTeamMembers[]> {
  return await prisma.project.findMany({
    where: { status },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function createProject(input: CreateProjectInput): Promise<ProjectWithTeamMembers> {
  return await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      methodology: input.methodology,
      status: input.status,
      priority: input.priority,
      progress: input.progress || 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      budget: input.budget,
      createdBy: input.createdBy,
      teamMembers: {
        create: input.teamMemberIds.map((userId) => ({
          userId,
        })),
      },
      tags: {
        create: input.tags.map((tag) => ({
          tag,
        })),
      },
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<ProjectWithTeamMembers | null> {
  // First, handle team members if provided
  if (input.teamMemberIds) {
    // Remove existing team members
    await prisma.projectTeamMember.deleteMany({
      where: { projectId: id },
    });
    
    // Add new team members
    await prisma.projectTeamMember.createMany({
      data: input.teamMemberIds.map((userId) => ({
        projectId: id,
        userId,
      })),
    });
  }

  // Handle tags if provided
  if (input.tags) {
    // Remove existing tags
    await prisma.projectTag.deleteMany({
      where: { projectId: id },
    });
    
    // Add new tags
    await prisma.projectTag.createMany({
      data: input.tags.map((tag) => ({
        projectId: id,
        tag,
      })),
    });
  }

  // Update the project
  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.methodology && { methodology: input.methodology }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.progress !== undefined && { progress: input.progress }),
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.dueDate && { dueDate: input.dueDate }),
      ...(input.budget !== undefined && { budget: input.budget }),
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });

  return updatedProject;
}

export async function deleteProject(id: string): Promise<boolean> {
  try {
    await prisma.project.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// User operations
export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}) {
  return await prisma.user.create({
    data,
  });
}

// Analytics functions
export async function getProjectStats() {
  const total = await prisma.project.count();
  const active = await prisma.project.count({ where: { status: ProjectStatus.ACTIVE } });
  const completed = await prisma.project.count({ where: { status: ProjectStatus.COMPLETED } });
  const blocked = await prisma.project.count({ where: { status: ProjectStatus.BLOCKED } });
  const onHold = await prisma.project.count({ where: { status: ProjectStatus.ON_HOLD } });

  const agileProjects = await prisma.project.count({ where: { methodology: ProjectMethodology.AGILE } });
  const waterfallProjects = await prisma.project.count({ where: { methodology: ProjectMethodology.WATERFALL } });
  const hybridProjects = await prisma.project.count({ where: { methodology: ProjectMethodology.HYBRID } });

  const budgetSum = await prisma.project.aggregate({
    _sum: {
      budget: true,
    },
  });

  const progressAvg = await prisma.project.aggregate({
    _avg: {
      progress: true,
    },
  });

  const totalBudget = budgetSum._sum.budget || 0;
  const avgProgress = Math.round(progressAvg._avg.progress || 0);

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
    avgProgress,
  };
}

// Program operations (similar to Project operations)
export async function getAllPrograms(): Promise<ProgramWithTeamMembers[]> {
  return await prisma.program.findMany({
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function getProgramById(id: string): Promise<ProgramWithTeamMembers | null> {
  return await prisma.program.findUnique({
    where: { id },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });
}

export async function getProgramsByMethodology(methodology: ProjectMethodology): Promise<ProgramWithTeamMembers[]> {
  return await prisma.program.findMany({
    where: { methodology },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function getProgramsByStatus(status: ProgramStatus): Promise<ProgramWithTeamMembers[]> {
  return await prisma.program.findMany({
    where: { status },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function createProgram(input: CreateProgramInput): Promise<ProgramWithTeamMembers> {
  return await prisma.program.create({
    data: {
      name: input.name,
      description: input.description,
      methodology: input.methodology,
      status: input.status,
      priority: input.priority,
      progress: input.progress || 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      budget: input.budget,
      createdBy: input.createdBy,
      teamMembers: {
        create: input.teamMemberIds.map((userId) => ({
          userId,
        })),
      },
      tags: {
        create: input.tags.map((tag) => ({
          tag,
        })),
      },
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });
}

export async function updateProgram(
  id: string,
  input: UpdateProgramInput
): Promise<ProgramWithTeamMembers | null> {
  // First, handle team members if provided
  if (input.teamMemberIds) {
    // Remove existing team members
    await prisma.programTeamMember.deleteMany({
      where: { programId: id },
    });
    
    // Add new team members
    await prisma.programTeamMember.createMany({
      data: input.teamMemberIds.map((userId) => ({
        programId: id,
        userId,
      })),
    });
  }

  // Handle tags if provided
  if (input.tags) {
    // Remove existing tags
    await prisma.programTag.deleteMany({
      where: { programId: id },
    });
    
    // Add new tags
    await prisma.programTag.createMany({
      data: input.tags.map((tag) => ({
        programId: id,
        tag,
      })),
    });
  }

  // Update the program
  const updatedProgram = await prisma.program.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.methodology && { methodology: input.methodology }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.progress !== undefined && { progress: input.progress }),
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.dueDate && { dueDate: input.dueDate }),
      ...(input.budget !== undefined && { budget: input.budget }),
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
    },
  });

  return updatedProgram;
}

export async function deleteProgram(id: string): Promise<boolean> {
  try {
    await prisma.program.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting program:', error);
    return false;
  }
}

// Program analytics functions
export async function getProgramStats() {
  const total = await prisma.program.count();
  const active = await prisma.program.count({ where: { status: ProjectStatus.ACTIVE } });
  const completed = await prisma.program.count({ where: { status: ProjectStatus.COMPLETED } });
  const blocked = await prisma.program.count({ where: { status: ProjectStatus.BLOCKED } });
  const onHold = await prisma.program.count({ where: { status: ProjectStatus.ON_HOLD } });

  const agilePrograms = await prisma.program.count({ where: { methodology: ProjectMethodology.AGILE } });
  const waterfallPrograms = await prisma.program.count({ where: { methodology: ProjectMethodology.WATERFALL } });
  const hybridPrograms = await prisma.program.count({ where: { methodology: ProjectMethodology.HYBRID } });

  const budgetSum = await prisma.program.aggregate({
    _sum: {
      budget: true,
    },
  });

  const progressAvg = await prisma.program.aggregate({
    _avg: {
      progress: true,
    },
  });

  const totalBudget = budgetSum._sum.budget || 0;
  const avgProgress = Math.round(progressAvg._avg.progress || 0);

  return {
    total,
    active,
    completed,
    blocked,
    onHold,
    agilePrograms,
    waterfallPrograms,
    hybridPrograms,
    totalBudget,
    avgProgress,
  };
}

// Portfolio interfaces and operations
export interface PortfolioWithDetails {
  id: string;
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: PortfolioStatus;
  priority: Priority;
  progress: number;
  startDate: string;
  dueDate: string;
  budget: number;
  lastUpdated: string;
  createdAt: string;
  createdBy: string;
  creator: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    role: string;
  };
  teamMembers: {
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      role: string;
    };
  }[];
  tags: {
    id: string;
    tag: string;
  }[];
  projects: {
    id: string;
    name: string;
    status: string;
    progress: number;
  }[];
}

export interface CreatePortfolioInput {
  name: string;
  description: string;
  methodology: ProjectMethodology;
  status: PortfolioStatus;
  priority: Priority;
  progress?: number;
  startDate: Date;
  dueDate: Date;
  budget: number;
  createdBy: string;
  teamMemberIds: string[];
  tags: string[];
  projectIds?: string[];
}

export interface UpdatePortfolioInput {
  name?: string;
  description?: string;
  methodology?: ProjectMethodology;
  status?: PortfolioStatus;
  priority?: Priority;
  progress?: number;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  teamMemberIds?: string[];
  tags?: string[];
  projectIds?: string[];
}

export async function getAllPortfolios(): Promise<PortfolioWithDetails[]> {
  return await prisma.portfolio.findMany({
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
        },
      },
    },
    orderBy: {
      lastUpdated: 'desc',
    },
  });
}

export async function getPortfolioById(id: string): Promise<PortfolioWithDetails | null> {
  return await prisma.portfolio.findUnique({
    where: { id },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
      projects: {
        include: {
          teamMembers: {
            include: {
              user: true,
            },
          },
          tags: true,
        },
      },
    },
  });
}

export async function createPortfolio(input: CreatePortfolioInput): Promise<PortfolioWithDetails> {
  return await prisma.portfolio.create({
    data: {
      name: input.name,
      description: input.description,
      methodology: input.methodology,
      status: input.status,
      priority: input.priority,
      progress: input.progress || 0,
      startDate: input.startDate,
      dueDate: input.dueDate,
      budget: input.budget,
      createdBy: input.createdBy,
      teamMembers: {
        create: input.teamMemberIds.map((userId) => ({
          userId,
        })),
      },
      tags: {
        create: input.tags.map((tag) => ({
          tag,
        })),
      },
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
        },
      },
    },
  });
}

export async function updatePortfolio(
  id: string,
  input: UpdatePortfolioInput
): Promise<PortfolioWithDetails | null> {
  // First, handle team members if provided
  if (input.teamMemberIds) {
    // Remove existing team members
    await prisma.portfolioTeamMember.deleteMany({
      where: { portfolioId: id },
    });
    
    // Add new team members
    await prisma.portfolioTeamMember.createMany({
      data: input.teamMemberIds.map((userId) => ({
        portfolioId: id,
        userId,
      })),
    });
  }

  // Handle tags if provided
  if (input.tags) {
    // Remove existing tags
    await prisma.portfolioTag.deleteMany({
      where: { portfolioId: id },
    });
    
    // Add new tags
    await prisma.portfolioTag.createMany({
      data: input.tags.map((tag) => ({
        portfolioId: id,
        tag,
      })),
    });
  }

  // Handle project assignments if provided
  if (input.projectIds) {
    // First, remove this portfolio from all projects
    await prisma.project.updateMany({
      where: { portfolioId: id },
      data: { portfolioId: null },
    });
    
    // Then assign new projects to this portfolio
    if (input.projectIds.length > 0) {
      await prisma.project.updateMany({
        where: {
          id: {
            in: input.projectIds,
          },
        },
        data: {
          portfolioId: id,
        },
      });
    }
  }

  // Update the portfolio
  const updatedPortfolio = await prisma.portfolio.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description && { description: input.description }),
      ...(input.methodology && { methodology: input.methodology }),
      ...(input.status && { status: input.status }),
      ...(input.priority && { priority: input.priority }),
      ...(input.progress !== undefined && { progress: input.progress }),
      ...(input.startDate && { startDate: input.startDate }),
      ...(input.dueDate && { dueDate: input.dueDate }),
      ...(input.budget !== undefined && { budget: input.budget }),
      lastUpdated: new Date(),
    },
    include: {
      creator: true,
      teamMembers: {
        include: {
          user: true,
        },
      },
      tags: true,
      projects: {
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
        },
      },
    },
  });

  return updatedPortfolio;
}

export async function deletePortfolio(id: string): Promise<boolean> {
  try {
    // First, remove portfolio associations from projects
    await prisma.project.updateMany({
      where: { portfolioId: id },
      data: { portfolioId: null },
    });

    // Delete the portfolio (cascade will handle team members and tags)
    await prisma.portfolio.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return false;
  }
}

// Portfolio analytics functions
export async function getPortfolioStats() {
  const total = await prisma.portfolio.count();
  const active = await prisma.portfolio.count({ where: { status: ProjectStatus.ACTIVE } });
  const completed = await prisma.portfolio.count({ where: { status: ProjectStatus.COMPLETED } });
  const blocked = await prisma.portfolio.count({ where: { status: ProjectStatus.BLOCKED } });
  const onHold = await prisma.portfolio.count({ where: { status: ProjectStatus.ON_HOLD } });

  const agilePortfolios = await prisma.portfolio.count({ where: { methodology: ProjectMethodology.AGILE } });
  const waterfallPortfolios = await prisma.portfolio.count({ where: { methodology: ProjectMethodology.WATERFALL } });
  const hybridPortfolios = await prisma.portfolio.count({ where: { methodology: ProjectMethodology.HYBRID } });

  const budgetSum = await prisma.portfolio.aggregate({
    _sum: {
      budget: true,
    },
  });

  const progressAvg = await prisma.portfolio.aggregate({
    _avg: {
      progress: true,
    },
  });

  const totalBudget = budgetSum._sum.budget || 0;
  const avgProgress = Math.round(progressAvg._avg.progress || 0);

  // Get total projects in portfolios
  const portfoliosWithProjects = await prisma.portfolio.findMany({
    include: {
      projects: true,
    },
  });

  const totalProjects = portfoliosWithProjects.reduce((sum, portfolio) => 
    sum + portfolio.projects.length, 0
  );

  const avgProjectsPerPortfolio = total > 0 ? Math.round((totalProjects / total) * 10) / 10 : 0;

  return {
    total,
    active,
    completed,
    blocked,
    onHold,
    agilePortfolios,
    waterfallPortfolios,
    hybridPortfolios,
    totalBudget,
    avgProgress,
    totalProjects,
    avgProjectsPerPortfolio,
  };
}