import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, updateProject, deleteProject, UpdateProjectInput } from '@/lib/database';
import { Methodology, ProjectStatus, Priority } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
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
    
    const updateData: UpdateProjectInput = {
      ...(body.name && { name: body.name }),
      ...(body.description && { description: body.description }),
      ...(body.methodology && { methodology: body.methodology as Methodology }),
      ...(body.status && { status: body.status as ProjectStatus }),
      ...(body.priority && { priority: body.priority as Priority }),
      ...(body.progress !== undefined && { progress: body.progress }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      ...(body.budget !== undefined && { budget: body.budget }),
      ...(body.teamMemberIds && { teamMemberIds: body.teamMemberIds }),
      ...(body.tags && { tags: body.tags }),
    };

    const project = await updateProject(id, updateData);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
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
    const success = await deleteProject(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}