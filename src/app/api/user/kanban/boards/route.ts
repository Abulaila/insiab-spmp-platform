import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-admin-user'; // Fallback for now

    // Get user's boards
    const userBoards = await prisma.userKanbanBoard.findMany({
      where: { userId },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        template: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    // If no boards exist, create default board from PMI template
    if (userBoards.length === 0) {
      const pmiTemplate = await prisma.boardTemplate.findUnique({
        where: { id: 'pmi-project-lifecycle-template' }
      });

      if (pmiTemplate) {
        const defaultBoard = await prisma.userKanbanBoard.create({
          data: {
            userId,
            name: 'My Project Board',
            description: 'Personal project management board',
            isDefault: true,
            templateId: pmiTemplate.id,
            settings: pmiTemplate.settings,
            columns: {
              create: (pmiTemplate.columns as any[]).map((col) => ({
                name: col.name,
                color: col.color,
                icon: col.icon,
                order: col.order,
                statusMapping: col.statusMapping,
                maxWipLimit: col.maxWipLimit
              }))
            }
          },
          include: {
            columns: {
              orderBy: { order: 'asc' }
            },
            template: true
          }
        });

        return NextResponse.json([defaultBoard]);
      }
    }

    return NextResponse.json(userBoards);

  } catch (error) {
    console.error('Error fetching user kanban boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user boards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, templateId, settings } = await request.json();

    if (!userId || !name) {
      return NextResponse.json(
        { error: 'User ID and board name are required' },
        { status: 400 }
      );
    }

    // Check if template exists
    let template = null;
    if (templateId) {
      template = await prisma.boardTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
    }

    // Create new user board
    const newBoard = await prisma.userKanbanBoard.create({
      data: {
        userId,
        name,
        description,
        templateId,
        settings: settings || template?.settings,
        columns: template ? {
          create: (template.columns as any[]).map((col) => ({
            name: col.name,
            color: col.color,
            icon: col.icon,
            order: col.order,
            statusMapping: col.statusMapping,
            maxWipLimit: col.maxWipLimit
          }))
        } : {
          create: [
            {
              name: 'Planning',
              color: '#3b82f6',
              icon: '📝',
              order: 0,
              statusMapping: 'active'
            },
            {
              name: 'In Progress',
              color: '#10b981',
              icon: '⚡',
              order: 1,
              statusMapping: 'active'
            },
            {
              name: 'Completed',
              color: '#6366f1',
              icon: '✅',
              order: 2,
              statusMapping: 'completed'
            }
          ]
        }
      },
      include: {
        columns: {
          orderBy: { order: 'asc' }
        },
        template: true
      }
    });

    return NextResponse.json(newBoard, { status: 201 });

  } catch (error) {
    console.error('Error creating user kanban board:', error);
    return NextResponse.json(
      { error: 'Failed to create user board' },
      { status: 500 }
    );
  }
}