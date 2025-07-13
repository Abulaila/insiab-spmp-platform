import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all programs with team members and tags
    const programs = await prisma.program.findMany({
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

    // Group programs by status for Kanban columns
    const kanbanData = {
      planning: programs.filter(p => p.status === 'active' && p.progress < 10),
      active: programs.filter(p => p.status === 'active' && p.progress >= 10),
      on_hold: programs.filter(p => p.status === 'on_hold'),
      blocked: programs.filter(p => p.status === 'blocked'),
      completed: programs.filter(p => p.status === 'completed')
    };

    // Add statistics
    const stats = {
      total: programs.length,
      planning: kanbanData.planning.length,
      active: kanbanData.active.length,
      on_hold: kanbanData.on_hold.length,
      blocked: kanbanData.blocked.length,
      completed: kanbanData.completed.length,
      totalBudget: programs.reduce((sum, p) => sum + p.budget, 0),
      avgProgress: Math.round(programs.reduce((sum, p) => sum + p.progress, 0) / programs.length),
      methodologyBreakdown: {
        agile: programs.filter(p => p.methodology === 'agile').length,
        waterfall: programs.filter(p => p.methodology === 'waterfall').length,
        hybrid: programs.filter(p => p.methodology === 'hybrid').length
      }
    };

    return NextResponse.json({
      columns: kanbanData,
      stats,
      programs
    });

  } catch (error) {
    console.error('Error fetching program kanban data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program kanban data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { programId, newStatus, newProgress } = await request.json();

    if (!programId || !newStatus) {
      return NextResponse.json(
        { error: 'Program ID and new status are required' },
        { status: 400 }
      );
    }

    // Update program status and potentially progress
    const updateData: any = { 
      status: newStatus,
      lastUpdated: new Date()
    };

    // Auto-adjust progress based on status
    if (newStatus === 'completed') {
      updateData.progress = 100;
    } else if (newStatus === 'active' && newProgress !== undefined) {
      updateData.progress = Math.max(10, newProgress); // Active programs should be at least 10%
    } else if (newProgress !== undefined) {
      updateData.progress = newProgress;
    }

    const updatedProgram = await prisma.program.update({
      where: { id: programId },
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

    return NextResponse.json(updatedProgram);

  } catch (error) {
    console.error('Error updating program status:', error);
    return NextResponse.json(
      { error: 'Failed to update program status' },
      { status: 500 }
    );
  }
}