import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, CreateProjectInput } from '@/lib/database';
import { Methodology, ProjectStatus, Priority } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const methodology = searchParams.get('methodology');
    const status = searchParams.get('status');

    let projects;
    
    if (methodology && methodology !== 'all') {
      const { getProjectsByMethodology } = await import('@/lib/database');
      projects = await getProjectsByMethodology(methodology as Methodology);
    } else if (status && status !== 'all') {
      const { getProjectsByStatus } = await import('@/lib/database');
      projects = await getProjectsByStatus(status as ProjectStatus);
    } else {
      projects = await getAllProjects();
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const projectData: CreateProjectInput = {
      name: body.name,
      description: body.description,
      methodology: body.methodology as Methodology,
      status: body.status as ProjectStatus,
      priority: body.priority as Priority,
      progress: body.progress || 0,
      startDate: new Date(body.startDate),
      dueDate: new Date(body.dueDate),
      budget: body.budget,
      createdBy: body.createdBy,
      teamMemberIds: body.teamMemberIds || [],
      tags: body.tags || [],
    };

    const project = await createProject(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}