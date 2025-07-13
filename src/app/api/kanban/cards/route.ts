import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      columnId,
      projectId,
      assigneeId,
      priority,
      dueDate,
      labels,
      coverColor,
      coverImage,
      createdBy,
      position
    } = body;

    // Get the highest position in the column for new cards
    const lastCard = await prisma.kanbanCard.findFirst({
      where: { columnId },
      orderBy: { position: 'desc' }
    });

    const newPosition = position !== undefined ? position : (lastCard?.position || 0) + 1000;

    const card = await prisma.kanbanCard.create({
      data: {
        title,
        description,
        columnId,
        projectId,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        labels: labels || [],
        coverColor,
        coverImage,
        createdBy,
        position: newPosition,
        order: 0 // Legacy field, use position for ordering
      },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        project: {
          select: { id: true, name: true, priority: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        }
      }
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Error creating kanban card:', error);
    return NextResponse.json(
      { error: 'Failed to create kanban card' },
      { status: 500 }
    );
  }
}

// Bulk update positions for drag and drop
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cards } = body; // Array of cards with updated positions and columnIds

    // Update multiple cards in a transaction
    const updatePromises = cards.map((card: any) =>
      prisma.kanbanCard.update({
        where: { id: card.id },
        data: {
          columnId: card.columnId,
          position: card.position
        }
      })
    );

    await prisma.$transaction(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating card positions:', error);
    return NextResponse.json(
      { error: 'Failed to update card positions' },
      { status: 500 }
    );
  }
}