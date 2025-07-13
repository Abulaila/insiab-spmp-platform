import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: params.id
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        tags: true,
        projects: {
          include: {
            teamMembers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            },
            tags: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
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
      name,
      description,
      methodology,
      status,
      priority,
      progress,
      startDate,
      dueDate,
      budget,
      teamMemberIds,
      tags,
      projectIds
    } = body;

    // Update the portfolio
    const portfolio = await prisma.portfolio.update({
      where: {
        id: params.id
      },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(methodology && { methodology }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(progress !== undefined && { progress }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(budget !== undefined && { budget: parseFloat(budget) }),
        lastUpdated: new Date()
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          }
        },
        tags: true,
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            progress: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Update team members if provided
    if (teamMemberIds) {
      // Remove existing team members
      await prisma.portfolioTeamMember.deleteMany({
        where: {
          portfolioId: params.id
        }
      });

      // Add new team members
      if (teamMemberIds.length > 0) {
        await prisma.portfolioTeamMember.createMany({
          data: teamMemberIds.map((userId: string) => ({
            portfolioId: params.id,
            userId
          }))
        });
      }
    }

    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await prisma.portfolioTag.deleteMany({
        where: {
          portfolioId: params.id
        }
      });

      // Add new tags
      if (tags.length > 0) {
        await prisma.portfolioTag.createMany({
          data: tags.map((tag: string) => ({
            portfolioId: params.id,
            tag
          }))
        });
      }
    }

    // Update project associations if provided
    if (projectIds) {
      // First, remove this portfolio from all projects
      await prisma.project.updateMany({
        where: {
          portfolioId: params.id
        },
        data: {
          portfolioId: null
        }
      });

      // Then assign new projects to this portfolio
      if (projectIds.length > 0) {
        await prisma.project.updateMany({
          where: {
            id: {
              in: projectIds
            }
          },
          data: {
            portfolioId: params.id
          }
        });
      }
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, remove portfolio associations from projects
    await prisma.project.updateMany({
      where: {
        portfolioId: params.id
      },
      data: {
        portfolioId: null
      }
    });

    // Delete the portfolio (cascade will handle team members and tags)
    await prisma.portfolio.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
}