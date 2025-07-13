import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: params.id },
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

    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban board' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description } = body;

    const board = await prisma.kanbanBoard.update({
      where: { id: params.id },
      data: { name, description },
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

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error updating kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to update kanban board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kanbanBoard.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to delete kanban board' },
      { status: 500 }
    );
  }
}