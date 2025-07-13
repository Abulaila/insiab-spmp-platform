import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, boardId, order, maxWipLimit } = body;

    const column = await prisma.kanbanColumn.create({
      data: {
        name,
        color,
        boardId,
        order,
        maxWipLimit
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

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error('Error creating kanban column:', error);
    return NextResponse.json(
      { error: 'Failed to create kanban column' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { columns } = body; // Array of columns with updated orders

    // Update multiple columns in a transaction
    const updatePromises = columns.map((col: any) =>
      prisma.kanbanColumn.update({
        where: { id: col.id },
        data: { order: col.order }
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering columns:', error);
    return NextResponse.json(
      { error: 'Failed to reorder columns' },
      { status: 500 }
    );
  }
}