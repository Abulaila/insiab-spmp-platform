import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const boards = await prisma.kanbanBoard.findMany({
      where: projectId ? { projectId } : {},
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: { id: true, name: true, avatar: true }
                },
                project: {
                  select: { id: true, name: true, priority: true }
                }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        project: {
          select: { id: true, name: true }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error('Error fetching kanban boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, projectId, createdBy } = body;

    // Use default admin user if no valid user provided
    let validCreatedBy = createdBy;
    if (!createdBy || createdBy === 'current-user-id') {
      validCreatedBy = 'default-admin-user';
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: validCreatedBy }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Create default columns for new board
    const defaultColumns = [
      { name: 'To Do', color: '#64748b', order: 0 },
      { name: 'In Progress', color: '#3b82f6', order: 1 },
      { name: 'Review', color: '#f59e0b', order: 2 },
      { name: 'Done', color: '#10b981', order: 3 }
    ];

    const board = await prisma.kanbanBoard.create({
      data: {
        name,
        description,
        projectId,
        createdBy: validCreatedBy,
        order: 0,
        columns: {
          create: defaultColumns
        }
      },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                assignee: {
                  select: { id: true, name: true, avatar: true }
                },
                project: {
                  select: { id: true, name: true, priority: true }
                }
              }
            }
          }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        project: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error('Error creating kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to create kanban board' },
      { status: 500 }
    );
  }
}