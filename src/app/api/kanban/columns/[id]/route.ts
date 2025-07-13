import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color, maxWipLimit, isCollapsed } = body;

    const column = await prisma.kanbanColumn.update({
      where: { id },
      data: {
        name,
        color,
        maxWipLimit,
        isCollapsed
      },
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
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error('Error updating kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to update kanban column' },
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
    // Check if column has cards
    const cardCount = await prisma.kanbanCard.count({
      where: { columnId: id }
    });

    if (cardCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete column with cards. Move cards first.' },
        { status: 400 }
      );
    }

    await prisma.kanbanColumn.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to delete kanban column' },
      { status: 500 }
    );
  }
}