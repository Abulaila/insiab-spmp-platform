import { NextRequest, NextResponse } from 'next/server';
import { getAllPrograms, createProgram, CreateProgramInput } from '@/lib/database';
import { Methodology, ProgramStatus, Priority } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const methodology = searchParams.get('methodology');
    const status = searchParams.get('status');

    let programs;
    
    if (methodology && methodology !== 'all') {
      const { getProgramsByMethodology } = await import('@/lib/database');
      programs = await getProgramsByMethodology(methodology as Methodology);
    } else if (status && status !== 'all') {
      const { getProgramsByStatus } = await import('@/lib/database');
      programs = await getProgramsByStatus(status as ProgramStatus);
    } else {
      programs = await getAllPrograms();
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const programData: CreateProgramInput = {
      name: body.name,
      description: body.description,
      methodology: body.methodology as Methodology,
      status: body.status as ProgramStatus,
      priority: body.priority as Priority,
      progress: body.progress || 0,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      budget: body.budget,
      createdBy: body.createdBy,
      teamMemberIds: body.teamMemberIds || [],
      tags: body.tags || [],
    };

    const program = await createProgram(programData);
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}