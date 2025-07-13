import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { boardId, userId, name, color, icon, maxWipLimit, statusMapping, settings } = await request.json();

    if (!boardId || !userId || !name) {
      return NextResponse.json(
        { error: 'Board ID, User ID, and column name are required' },
        { status: 400 }
      );
    }

    // Verify board belongs to user
    const board = await prisma.userKanbanBoard.findFirst({
      where: { id: boardId, userId },
      include: { columns: true }
    });

    if (!board) {
      return NextResponse.json(
        { error: 'Board not found or access denied' },
        { status: 404 }
      );
    }

    // Get next order position
    const maxOrder = board.columns.length > 0 
      ? Math.max(...board.columns.map(col => col.order))
      : -1;

    const newColumn = await prisma.userKanbanColumn.create({
      data: {
        boardId,
        name,
        color: color || '#64748b',
        icon,
        order: maxOrder + 1,
        maxWipLimit,
        statusMapping,
        settings
      }
    });

    return NextResponse.json(newColumn, { status: 201 });

  } catch (error) {
    console.error('Error creating user kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to create column' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { columns, userId } = await request.json();

    if (!columns || !Array.isArray(columns) || !userId) {
      return NextResponse.json(
        { error: 'Columns array and User ID are required' },
        { status: 400 }
      );
    }

    // Verify all columns belong to user's boards
    const columnIds = columns.map(col => col.id);
    const userColumns = await prisma.userKanbanColumn.findMany({
      where: {
        id: { in: columnIds },
        board: { userId }
      }
    });

    if (userColumns.length !== columnIds.length) {
      return NextResponse.json(
        { error: 'One or more columns not found or access denied' },
        { status: 404 }
      );
    }

    // Batch update columns (useful for reordering)
    const updatePromises = columns.map(col =>
      prisma.userKanbanColumn.update({
        where: { id: col.id },
        data: {
          name: col.name,
          color: col.color,
          icon: col.icon,
          order: col.order,
          maxWipLimit: col.maxWipLimit,
          isCollapsed: col.isCollapsed,
          statusMapping: col.statusMapping,
          settings: col.settings
        }
      })
    );

    const updatedColumns = await Promise.all(updatePromises);

    return NextResponse.json(updatedColumns);

  } catch (error) {
    console.error('Error updating user kanban columns:', error);
    return NextResponse.json(
      { error: 'Failed to update columns' },
      { status: 500 }
    );
  }
}