import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all projects with team members and tags
    const projects = await prisma.project.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        tags: true
      },
      orderBy: [
        { priority: 'desc' },
        { lastUpdated: 'desc' }
      ]
    });

    // Group projects by status for Kanban columns
    const kanbanData = {
      planning: projects.filter(p => p.status === 'active' && p.progress < 10),
      active: projects.filter(p => p.status === 'active' && p.progress >= 10),
      on_hold: projects.filter(p => p.status === 'on_hold'),
      blocked: projects.filter(p => p.status === 'blocked'),
      completed: projects.filter(p => p.status === 'completed')
    };

    // Add statistics
    const stats = {
      total: projects.length,
      planning: kanbanData.planning.length,
      active: kanbanData.active.length,
      on_hold: kanbanData.on_hold.length,
      blocked: kanbanData.blocked.length,
      completed: kanbanData.completed.length,
      totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
      avgProgress: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length),
      methodologyBreakdown: {
        agile: projects.filter(p => p.methodology === 'agile').length,
        waterfall: projects.filter(p => p.methodology === 'waterfall').length,
        hybrid: projects.filter(p => p.methodology === 'hybrid').length
      }
    };

    return NextResponse.json({
      columns: kanbanData,
      stats,
      projects
    });

  } catch (error) {
    console.error('Error fetching project kanban data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project kanban data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { projectId, newStatus, newProgress } = await request.json();

    if (!projectId || !newStatus) {
      return NextResponse.json(
        { error: 'Project ID and new status are required' },
        { status: 400 }
      );
    }

    // Update project status and potentially progress
    const updateData: any = { 
      status: newStatus,
      lastUpdated: new Date()
    };

    // Auto-adjust progress based on status
    if (newStatus === 'completed') {
      updateData.progress = 100;
    } else if (newStatus === 'active' && newProgress !== undefined) {
      updateData.progress = Math.max(10, newProgress); // Active projects should be at least 10%
    } else if (newProgress !== undefined) {
      updateData.progress = newProgress;
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        tags: true
      }
    });

    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json(
      { error: 'Failed to update project status' },
      { status: 500 }
    );
  }
}