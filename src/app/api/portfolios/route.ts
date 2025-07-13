import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
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
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      name,
      description,
      methodology,
      status,
      priority,
      progress = 0,
      startDate,
      dueDate,
      budget,
      createdBy,
      teamMemberIds = [],
      tags = [],
      projectIds = []
    } = body;

    // Validate required fields
    if (!name || !description || !methodology || !status || !priority || !startDate || !dueDate || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        description,
        methodology,
        status,
        priority,
        progress,
        startDate: new Date(startDate),
        dueDate: new Date(dueDate),
        budget: parseFloat(budget),
        createdBy,
        teamMembers: {
          create: teamMemberIds.map((userId: string) => ({
            userId
          }))
        },
        tags: {
          create: tags.map((tag: string) => ({
            tag
          }))
        }
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

    // Update projects to belong to this portfolio if projectIds provided
    if (projectIds.length > 0) {
      await prisma.project.updateMany({
        where: {
          id: {
            in: projectIds
          }
        },
        data: {
          portfolioId: portfolio.id
        }
      });
    }

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}