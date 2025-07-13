import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await prisma.kanbanCard.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true }
        },
        project: {
          select: { id: true, name: true, priority: true }
        },
        creator: {
          select: { id: true, name: true, avatar: true }
        },
        column: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error fetching kanban card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban card' },
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
    const {
      title,
      description,
      assigneeId,
      priority,
      dueDate,
      labels,
      coverColor,
      coverImage,
      checklist,
      attachments
    } = body;

    const card = await prisma.kanbanCard.update({
      where: { id: params.id },
      data: {
        title,
        description,
        assigneeId,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        labels,
        coverColor,
        coverImage,
        checklist,
        attachments
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
        },
        column: {
          select: { id: true, name: true, color: true }
        }
      }
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error updating kanban card:', error);
    return NextResponse.json(
      { error: 'Failed to update kanban card' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.kanbanCard.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kanban card:', error);
    return NextResponse.json(
      { error: 'Failed to delete kanban card' },
      { status: 500 }
    );
  }
}