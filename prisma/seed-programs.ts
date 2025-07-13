import { PrismaClient, ProjectMethodology, ProjectStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPrograms() {
  console.log('🌱 Seeding programs...');

  // First, get or create a default user
  let defaultUser = await prisma.user.findFirst({
    where: { email: 'admin@insiab.com' }
  });

  if (!defaultUser) {
    defaultUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@insiab.com',
        role: 'Admin',
        avatar: null
      }
    });
  }

  // Create additional users for team members
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@insiab.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@insiab.com',
        role: 'Program Manager',
        avatar: null
      }
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@insiab.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane.smith@insiab.com',
        role: 'Senior Developer',
        avatar: null
      }
    }),
    prisma.user.upsert({
      where: { email: 'mike.wilson@insiab.com' },
      update: {},
      create: {
        name: 'Mike Wilson',
        email: 'mike.wilson@insiab.com',
        role: 'Business Analyst',
        avatar: null
      }
    })
  ]);

  // Sample programs data
  const programsData = [
    {
      name: 'Digital Transformation Initiative',
      description: 'Comprehensive digital transformation program to modernize legacy systems and improve operational efficiency across all business units.',
      methodology: ProjectMethodology.AGILE,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 45,
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-12-31'),
      budget: 2500000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id, users[2].id],
      tags: ['digital', 'transformation', 'enterprise', 'strategic']
    },
    {
      name: 'Customer Experience Enhancement',
      description: 'Multi-phase program to enhance customer experience across all touchpoints including web, mobile, and in-store interactions.',
      methodology: ProjectMethodology.HYBRID,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 67,
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-11-30'),
      budget: 1800000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[2].id],
      tags: ['customer', 'experience', 'omnichannel', 'design']
    },
    {
      name: 'Cloud Infrastructure Migration',
      description: 'Strategic program to migrate all on-premise infrastructure to cloud-based solutions with improved scalability and security.',
      methodology: ProjectMethodology.WATERFALL,
      status: ProjectStatus.ACTIVE,
      priority: Priority.MEDIUM,
      progress: 23,
      startDate: new Date('2024-03-01'),
      dueDate: new Date('2025-06-30'),
      budget: 3200000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[1].id, users[2].id],
      tags: ['cloud', 'infrastructure', 'migration', 'security', 'aws']
    },
    {
      name: 'AI-Powered Analytics Platform',
      description: 'Development of an enterprise-wide AI and machine learning platform to provide advanced analytics and predictive insights.',
      methodology: ProjectMethodology.AGILE,
      status: ProjectStatus.ACTIVE,
      priority: Priority.MEDIUM,
      progress: 89,
      startDate: new Date('2023-09-01'),
      dueDate: new Date('2024-08-31'),
      budget: 1500000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id],
      tags: ['ai', 'analytics', 'machine-learning', 'data-science']
    },
    {
      name: 'Cybersecurity Modernization',
      description: 'Comprehensive cybersecurity program to implement zero-trust architecture and advanced threat detection systems.',
      methodology: ProjectMethodology.HYBRID,
      status: 'on_hold',
      priority: Priority.HIGH,
      progress: 12,
      startDate: new Date('2024-04-01'),
      dueDate: new Date('2025-03-31'),
      budget: 2800000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[1].id, users[2].id],
      tags: ['security', 'zero-trust', 'threat-detection', 'compliance']
    },
    {
      name: 'Mobile-First Strategy Implementation',
      description: 'Strategic program to implement mobile-first approach across all customer-facing applications and internal tools.',
      methodology: ProjectMethodology.AGILE,
      status: 'completed',
      priority: Priority.MEDIUM,
      progress: 100,
      startDate: new Date('2023-06-01'),
      dueDate: new Date('2024-05-31'),
      budget: 950000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id],
      tags: ['mobile', 'strategy', 'apps', 'responsive']
    },
    {
      name: 'Supply Chain Optimization',
      description: 'Enterprise program to optimize supply chain operations through automation, IoT integration, and predictive analytics.',
      methodology: ProjectMethodology.WATERFALL,
      status: ProjectStatus.ACTIVE,
      priority: 'low',
      progress: 34,
      startDate: new Date('2024-05-01'),
      dueDate: new Date('2025-08-31'),
      budget: 2100000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[2].id],
      tags: ['supply-chain', 'optimization', 'iot', 'automation']
    },
    {
      name: 'Sustainability Initiative',
      description: 'Comprehensive sustainability program to achieve carbon neutrality and implement green technology solutions.',
      methodology: ProjectMethodology.HYBRID,
      status: 'blocked',
      priority: 'low',
      progress: 8,
      startDate: new Date('2024-06-01'),
      dueDate: new Date('2026-12-31'),
      budget: 1200000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id, users[2].id],
      tags: ['sustainability', 'green-tech', 'carbon-neutral', 'environment']
    }
  ];

  // Create programs
  for (const programData of programsData) {
    const { teamMemberIds, tags, ...programFields } = programData;
    
    const program = await prisma.program.create({
      data: {
        ...programFields,
        teamMembers: {
          create: teamMemberIds.map(userId => ({
            userId
          }))
        },
        tags: {
          create: tags.map(tag => ({
            tag
          }))
        }
      },
      include: {
        teamMembers: {
          include: {
            user: true
          }
        },
        tags: true
      }
    });

    console.log(`✅ Created program: ${program.name} (${program.status})`);
  }

  console.log('🎉 Programs seeded successfully!');
}

export default seedPrograms;

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPrograms()
    .catch((e) => {
      console.error('❌ Error seeding programs:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}