import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: params.id
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
          }
        },
        subtasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            tags: true
          }
        },
        parentTask: {
          select: {
            id: true,
            title: true,
            status: true,
            progress: true
          }
        },
        dependencies: {
          include: {
            blockingTask: {
              select: {
                id: true,
                title: true,
                status: true,
                progress: true,
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
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
                status: true,
                progress: true,
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' },
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
      status,
      priority,
      progress,
      startDate,
      dueDate,
      estimatedHours,
      actualHours,
      completedAt,
      projectId,
      assigneeId,
      tags,
      parentTaskId
    } = body;

    // Update the main task fields
    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(progress !== undefined && { progress }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(estimatedHours !== undefined && { estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null }),
      ...(actualHours !== undefined && { actualHours: actualHours ? parseFloat(actualHours) : 0 }),
      ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      ...(projectId !== undefined && { projectId }),
      ...(assigneeId !== undefined && { assigneeId }),
      ...(parentTaskId !== undefined && { parentTaskId }),
      lastUpdated: new Date()
    };

    // Handle completion logic
    if (status === 'completed' && !completedAt) {
      updateData.completedAt = new Date();
      updateData.progress = 100;
    } else if (status !== 'completed' && completedAt) {
      updateData.completedAt = null;
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await prisma.taskTag.deleteMany({
        where: {
          taskId: params.id
        }
      });

      // Add new tags
      if (tags.length > 0) {
        await prisma.taskTag.createMany({
          data: tags.map((tag: string) => ({
            taskId: params.id,
            tag
          }))
        });
      }
    }

    const task = await prisma.task.update({
      where: {
        id: params.id
      },
      data: updateData,
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

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete the task (cascade will handle dependencies, tags, and comments)
    await prisma.task.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}