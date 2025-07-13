import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    const where: any = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (assigneeId) {
      where.assigneeId = assigneeId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        tags: true,
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Only get latest 5 comments for list view
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            progress: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true
          }
        },
        dependencies: {
          include: {
            blockingTask: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        },
        dependentTasks: {
          include: {
            dependentTask: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      status = 'not_started',
      priority = 'medium',
      progress = 0,
      startDate,
      dueDate,
      estimatedHours,
      projectId,
      assigneeId,
      createdBy,
      tags = [],
      parentTaskId
    } = body;

    // Validate required fields
    if (!title || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: title and createdBy' },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        progress,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        projectId,
        assigneeId,
        createdBy,
        parentTaskId,
        tags: {
          create: tags.map((tag: string) => ({
            tag
          }))
        }
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        tags: true,
        comments: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        subtasks: {
          select: {
            id: true,
            title: true,
            status: true,
            progress: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}