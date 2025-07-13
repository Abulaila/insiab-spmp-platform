import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users first - start with default admin user
  const defaultAdmin = await prisma.user.upsert({
    where: { email: 'admin@projectos.com' },
    update: {},
    create: {
      id: 'default-admin-user',
      name: 'Admin User',
      email: 'admin@projectos.com',
      avatar: '👤',
      role: 'System Administrator',
    },
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah@projectos.com' },
      update: {},
      create: {
        name: 'Sarah Chen',
        email: 'sarah@projectos.com',
        avatar: '👩‍💻',
        role: 'Project Manager',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex@projectos.com' },
      update: {},
      create: {
        name: 'Alex Rodriguez',
        email: 'alex@projectos.com',
        avatar: '👨‍💼',
        role: 'Tech Lead',
      },
    }),
    prisma.user.upsert({
      where: { email: 'emily@projectos.com' },
      update: {},
      create: {
        name: 'Emily Johnson',
        email: 'emily@projectos.com',
        avatar: '👩‍🎨',
        role: 'UI/UX Designer',
      },
    }),
    prisma.user.upsert({
      where: { email: 'michael@projectos.com' },
      update: {},
      create: {
        name: 'Michael Kim',
        email: 'michael@projectos.com',
        avatar: '👨‍💻',
        role: 'Frontend Developer',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jessica@projectos.com' },
      update: {},
      create: {
        name: 'Jessica Wu',
        email: 'jessica@projectos.com',
        avatar: '👩‍🔬',
        role: 'Data Scientist',
      },
    }),
    prisma.user.upsert({
      where: { email: 'david@projectos.com' },
      update: {},
      create: {
        name: 'David Thompson',
        email: 'david@projectos.com',
        avatar: '👨‍🔧',
        role: 'DevOps Engineer',
      },
    }),
    prisma.user.upsert({
      where: { email: 'lisa@projectos.com' },
      update: {},
      create: {
        name: 'Lisa Park',
        email: 'lisa@projectos.com',
        avatar: '👩‍💼',
        role: 'Business Analyst',
      },
    }),
    prisma.user.upsert({
      where: { email: 'james@projectos.com' },
      update: {},
      create: {
        name: 'James Wilson',
        email: 'james@projectos.com',
        avatar: '👨‍🎯',
        role: 'QA Engineer',
      },
    }),
  ]);

  // Add default admin to users array
  const allUsers = [defaultAdmin, ...users];
  console.log('Created users:', allUsers.length);

  // Create projects
  const projects = [
    {
      name: 'ProjectOS 2.0 Platform',
      description: 'Enterprise intelligence platform development with AI-powered analytics',
      methodology: 'AGILE',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 87,
      startDate: new Date('2025-01-15'),
      dueDate: new Date('2025-07-25'),
      budget: 450000,
      createdBy: users[0].id, // Sarah Chen
      teamMemberIds: [users[0].id, users[1].id, users[2].id, users[3].id],
      tags: ['Enterprise', 'AI', 'Analytics', 'Platform'],
    },
    {
      name: 'AI Analytics Engine',
      description: 'Machine learning integration for predictive insights and automated reporting',
      methodology: 'HYBRID',
      status: 'ACTIVE',
      priority: 'HIGH',
      progress: 62,
      startDate: new Date('2025-03-01'),
      dueDate: new Date('2025-08-15'),
      budget: 320000,
      createdBy: users[1].id, // Alex Rodriguez
      teamMemberIds: [users[4].id, users[1].id, users[5].id],
      tags: ['AI', 'Machine Learning', 'Analytics', 'Automation'],
    },
    {
      name: 'Enterprise Dashboard',
      description: 'Executive KPI visualization and real-time reporting system',
      methodology: 'WATERFALL',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 34,
      startDate: new Date('2025-04-01'),
      dueDate: new Date('2025-09-01'),
      budget: 180000,
      createdBy: users[2].id, // Emily Johnson
      teamMemberIds: [users[2].id, users[3].id, users[6].id],
      tags: ['Dashboard', 'KPI', 'Visualization', 'Reporting'],
    },
    {
      name: 'Mobile App Redesign',
      description: 'Complete overhaul of mobile application with modern UI/UX',
      methodology: 'AGILE',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 45,
      startDate: new Date('2025-02-15'),
      dueDate: new Date('2025-08-30'),
      budget: 150000,
      createdBy: users[2].id, // Emily Johnson
      teamMemberIds: [users[2].id, users[3].id, users[7].id],
      tags: ['Mobile', 'UI/UX', 'Redesign', 'App'],
    },
    {
      name: 'Security Infrastructure',
      description: 'Implementation of enterprise-grade security measures and compliance',
      methodology: 'WATERFALL',
      status: 'ON_HOLD',
      priority: 'HIGH',
      progress: 23,
      startDate: new Date('2025-01-01'),
      dueDate: new Date('2025-10-15'),
      budget: 275000,
      createdBy: users[5].id, // David Thompson
      teamMemberIds: [users[5].id, users[7].id, users[0].id],
      tags: ['Security', 'Compliance', 'Infrastructure', 'Enterprise'],
    },
    {
      name: 'Customer Portal',
      description: 'Self-service customer portal with advanced features',
      methodology: 'HYBRID',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      progress: 100,
      startDate: new Date('2024-10-01'),
      dueDate: new Date('2025-03-15'),
      budget: 120000,
      createdBy: users[6].id, // Lisa Park
      teamMemberIds: [users[3].id, users[6].id, users[7].id],
      tags: ['Portal', 'Customer', 'Self-service', 'Web'],
    },
    {
      name: 'API Integration Hub',
      description: 'Centralized API management and integration platform',
      methodology: 'AGILE',
      status: 'ON_HOLD',
      priority: 'HIGH',
      progress: 78,
      startDate: new Date('2025-02-01'),
      dueDate: new Date('2025-07-30'),
      budget: 200000,
      createdBy: users[1].id, // Alex Rodriguez
      teamMemberIds: [users[1].id, users[5].id, users[3].id],
      tags: ['API', 'Integration', 'Platform', 'Backend'],
    },
    {
      name: 'Data Warehouse Migration',
      description: 'Migration of legacy data systems to modern cloud infrastructure',
      methodology: 'WATERFALL',
      status: 'ACTIVE',
      priority: 'MEDIUM',
      progress: 56,
      startDate: new Date('2025-03-15'),
      dueDate: new Date('2025-09-30'),
      budget: 380000,
      createdBy: users[4].id, // Jessica Wu
      teamMemberIds: [users[4].id, users[5].id, users[0].id],
      tags: ['Data', 'Migration', 'Cloud', 'Infrastructure'],
    },
    {
      name: 'Automation Framework',
      description: 'Enterprise automation framework for business processes',
      methodology: 'HYBRID',
      status: 'ACTIVE',
      priority: 'LOW',
      progress: 29,
      startDate: new Date('2025-05-01'),
      dueDate: new Date('2025-11-15'),
      budget: 95000,
      createdBy: users[5].id, // David Thompson
      teamMemberIds: [users[5].id, users[7].id, users[1].id],
      tags: ['Automation', 'Framework', 'Process', 'Efficiency'],
    },
    {
      name: 'Performance Optimization',
      description: 'System-wide performance improvements and optimization',
      methodology: 'AGILE',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      progress: 100,
      startDate: new Date('2024-11-01'),
      dueDate: new Date('2025-04-30'),
      budget: 85000,
      createdBy: users[1].id, // Alex Rodriguez
      teamMemberIds: [users[1].id, users[5].id, users[7].id],
      tags: ['Performance', 'Optimization', 'System', 'Speed'],
    },
  ];

  for (const projectData of projects) {
    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        methodology: projectData.methodology as any,
        status: projectData.status as any,
        priority: projectData.priority as any,
        progress: projectData.progress,
        startDate: projectData.startDate,
        dueDate: projectData.dueDate,
        budget: projectData.budget,
        createdBy: projectData.createdBy,
        teamMembers: {
          create: projectData.teamMemberIds.map((userId) => ({
            userId,
          })),
        },
        tags: {
          create: projectData.tags.map((tag) => ({
            tag,
          })),
        },
      },
    });

    console.log(`Created project: ${project.name}`);
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });