import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const methodology = searchParams.get('methodology');

    const whereClause: any = {
      isPublic: true
    };

    if (category) {
      whereClause.category = category;
    }

    if (methodology) {
      whereClause.methodology = methodology;
    }

    const templates = await prisma.boardTemplate.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        methodology: true,
        columns: true,
        settings: true,
        previewImage: true,
        createdAt: true
      },
      orderBy: [
        { category: 'asc' },
        { methodology: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(templates);

  } catch (error) {
    console.error('Error fetching board templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch board templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      description, 
      category, 
      methodology, 
      columns, 
      settings, 
      isPublic = false,
      createdBy 
    } = await request.json();

    if (!name || !category || !columns || !createdBy) {
      return NextResponse.json(
        { error: 'Name, category, columns, and creator are required' },
        { status: 400 }
      );
    }

    const template = await prisma.boardTemplate.create({
      data: {
        name,
        description,
        category,
        methodology,
        columns,
        settings,
        isPublic,
        createdBy
      }
    });

    return NextResponse.json(template, { status: 201 });

  } catch (error) {
    console.error('Error creating board template:', error);
    return NextResponse.json(
      { error: 'Failed to create board template' },
      { status: 500 }
    );
  }
}