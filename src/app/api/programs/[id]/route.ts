import { NextRequest, NextResponse } from 'next/server';
import { getProgramById, updateProgram, deleteProgram, UpdateProgramInput } from '@/lib/database';
import { Methodology, ProgramStatus, Priority } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const program = await getProgramById(id);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updateData: UpdateProgramInput = {
      ...(body.name && { name: body.name }),
      ...(body.description && { description: body.description }),
      ...(body.methodology && { methodology: body.methodology as Methodology }),
      ...(body.status && { status: body.status as ProgramStatus }),
      ...(body.priority && { priority: body.priority as Priority }),
      ...(body.progress !== undefined && { progress: body.progress }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      ...(body.budget !== undefined && { budget: body.budget }),
      ...(body.teamMemberIds && { teamMemberIds: body.teamMemberIds }),
      ...(body.tags && { tags: body.tags }),
    };

    const program = await updateProgram(id, updateData);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteProgram(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete program' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Error deleting program:', error);
    return NextResponse.json(
      { error: 'Failed to delete program' },
      { status: 500 }
    );
  }
}