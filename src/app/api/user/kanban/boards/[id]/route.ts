import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-admin-user';

    const board = await prisma.userKanbanBoard.findFirst({
      where: { 
        id,
        userId 
      },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        template: true
      }
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(board);

  } catch (error) {
    console.error('Error fetching user kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, name, description, settings } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify board belongs to user
    const existingBoard = await prisma.userKanbanBoard.findFirst({
      where: { id, userId }
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    const updatedBoard = await prisma.userKanbanBoard.update({
      where: { id },
      data: {
        name,
        description,
        settings
      },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        template: true
      }
    });

    return NextResponse.json(updatedBoard);

  } catch (error) {
    console.error('Error updating user kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to update board' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-admin-user';

    // Verify board belongs to user
    const existingBoard = await prisma.userKanbanBoard.findFirst({
      where: { id, userId }
    });

    if (!existingBoard) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Prevent deleting the last/default board
    if (existingBoard.isDefault) {
      const userBoardCount = await prisma.userKanbanBoard.count({
        where: { userId }
      });

      if (userBoardCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last board. Create another board first.' },
          { status: 400 }
        );
      }
    }

    await prisma.userKanbanBoard.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to delete board' },
      { status: 500 }
    );
  }
}