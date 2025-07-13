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

    const column = await prisma.userKanbanColumn.findFirst({
      where: { 
        id,
        board: { userId }
      },
      include: {
        board: {
          select: { id: true, name: true, userId: true }
        }
      }
    });

    if (!column) {
      return NextResponse.json(
        { error: 'Column not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(column);

  } catch (error) {
    console.error('Error fetching user kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to fetch column' },
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
    const { userId, name, color, icon, maxWipLimit, isCollapsed, statusMapping, settings } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify column belongs to user's board
    const existingColumn = await prisma.userKanbanColumn.findFirst({
      where: { 
        id,
        board: { userId }
      }
    });

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Column not found or access denied' },
        { status: 404 }
      );
    }

    const updatedColumn = await prisma.userKanbanColumn.update({
      where: { id },
      data: {
        name,
        color,
        icon,
        maxWipLimit,
        isCollapsed,
        statusMapping,
        settings
      }
    });

    return NextResponse.json(updatedColumn);

  } catch (error) {
    console.error('Error updating user kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to update column' },
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

    // Verify column belongs to user's board
    const existingColumn = await prisma.userKanbanColumn.findFirst({
      where: { 
        id,
        board: { userId }
      },
      include: {
        board: {
          include: { columns: true }
        }
      }
    });

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Column not found or access denied' },
        { status: 404 }
      );
    }

    // Prevent deleting the last column
    if (existingColumn.board.columns.length <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last column. Add another column first.' },
        { status: 400 }
      );
    }

    await prisma.userKanbanColumn.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting user kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to delete column' },
      { status: 500 }
    );
  }
}