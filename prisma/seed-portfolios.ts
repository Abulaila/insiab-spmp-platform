import { PrismaClient, ProjectMethodology, ProjectStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

async function seedPortfolios() {
  console.log('🌱 Seeding portfolios...');

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
      where: { email: 'sarah.johnson@insiab.com' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@insiab.com',
        role: 'Portfolio Manager',
        avatar: null
      }
    }),
    prisma.user.upsert({
      where: { email: 'david.chen@insiab.com' },
      update: {},
      create: {
        name: 'David Chen',
        email: 'david.chen@insiab.com',
        role: 'Strategic Director',
        avatar: null
      }
    }),
    prisma.user.upsert({
      where: { email: 'maria.rodriguez@insiab.com' },
      update: {},
      create: {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@insiab.com',
        role: 'Business Analyst',
        avatar: null
      }
    }),
    prisma.user.upsert({
      where: { email: 'alex.thompson@insiab.com' },
      update: {},
      create: {
        name: 'Alex Thompson',
        email: 'alex.thompson@insiab.com',
        role: 'Technology Lead',
        avatar: null
      }
    })
  ]);

  // Sample portfolios data
  const portfoliosData = [
    {
      name: 'Digital Innovation Portfolio',
      description: 'Comprehensive portfolio focused on digital transformation initiatives across multiple business units, including AI integration, cloud modernization, and customer experience enhancement.',
      methodology: ProjectMethodology.AGILE,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 65,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-12-31'),
      budget: 12500000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id, users[2].id, users[3].id],
      tags: ['digital', 'innovation', 'ai', 'strategic', 'transformation']
    },
    {
      name: 'Market Expansion Portfolio',
      description: 'Strategic portfolio aimed at expanding market presence in emerging markets, including new product development, localization efforts, and regional partnerships.',
      methodology: ProjectMethodology.HYBRID,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 42,
      startDate: new Date('2024-02-15'),
      dueDate: new Date('2025-06-30'),
      budget: 8750000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id, users[2].id],
      tags: ['market-expansion', 'growth', 'international', 'partnerships']
    },
    {
      name: 'Operational Excellence Portfolio',
      description: 'Portfolio dedicated to improving operational efficiency through process optimization, automation implementation, and quality management initiatives.',
      methodology: 'waterfall',
      status: ProjectStatus.ACTIVE,
      priority: 'medium',
      progress: 78,
      startDate: new Date('2023-09-01'),
      dueDate: new Date('2024-08-31'),
      budget: 5200000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[1].id, users[3].id],
      tags: ['operations', 'efficiency', 'automation', 'quality', 'process']
    },
    {
      name: 'Customer Experience Innovation',
      description: 'Portfolio focused on revolutionizing customer interactions through omnichannel experiences, personalization engines, and customer journey optimization.',
      methodology: ProjectMethodology.AGILE,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 89,
      startDate: new Date('2023-11-01'),
      dueDate: new Date('2024-09-30'),
      budget: 7300000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[2].id],
      tags: ['customer-experience', 'personalization', 'omnichannel', 'journey']
    },
    {
      name: 'Sustainability & ESG Portfolio',
      description: 'Environmental, Social, and Governance portfolio encompassing carbon reduction initiatives, sustainable technology adoption, and corporate responsibility programs.',
      methodology: ProjectMethodology.HYBRID,
      status: 'on_hold',
      priority: 'medium',
      progress: 23,
      startDate: new Date('2024-03-01'),
      dueDate: new Date('2025-12-31'),
      budget: 4600000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[2].id, users[3].id],
      tags: ['sustainability', 'esg', 'environment', 'social', 'governance']
    },
    {
      name: 'Product Innovation Lab',
      description: 'Research and development portfolio for next-generation products, including emerging technology exploration, prototype development, and market validation.',
      methodology: ProjectMethodology.AGILE,
      status: 'completed',
      priority: 'low',
      progress: 100,
      startDate: new Date('2023-04-01'),
      dueDate: new Date('2024-03-31'),
      budget: 3400000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[1].id, users[3].id],
      tags: ['innovation', 'r&d', 'products', 'emerging-tech', 'prototyping']
    },
    {
      name: 'Data & Analytics Platform',
      description: 'Enterprise-wide data and analytics portfolio including data lake implementation, business intelligence tools, and advanced analytics capabilities.',
      methodology: 'waterfall',
      status: 'blocked',
      priority: Priority.HIGH,
      progress: 34,
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2025-03-31'),
      budget: 9800000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[1].id, users[3].id],
      tags: ['data', 'analytics', 'platform', 'business-intelligence', 'data-lake']
    },
    {
      name: 'Cybersecurity Enhancement',
      description: 'Comprehensive cybersecurity portfolio focused on threat protection, compliance management, security awareness, and incident response capabilities.',
      methodology: ProjectMethodology.HYBRID,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      progress: 56,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-11-30'),
      budget: 6700000,
      createdBy: defaultUser.id,
      teamMemberIds: [users[0].id, users[3].id],
      tags: ['cybersecurity', 'threat-protection', 'compliance', 'security']
    }
  ];

  // Create portfolios
  for (const portfolioData of portfoliosData) {
    const { teamMemberIds, tags, ...portfolioFields } = portfolioData;
    
    const portfolio = await prisma.portfolio.create({
      data: {
        ...portfolioFields,
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
        tags: true,
        projects: true
      }
    });

    console.log(`✅ Created portfolio: ${portfolio.name} (${portfolio.status})`);
  }

  // Get some existing projects to assign to portfolios (if any exist)
  const existingProjects = await prisma.project.findMany({
    take: 5,
    where: {
      portfolioId: null // Only get projects not already in a portfolio
    }
  });

  if (existingProjects.length > 0) {
    // Assign first 2 projects to Digital Innovation Portfolio
    const digitalPortfolio = await prisma.portfolio.findFirst({
      where: { name: 'Digital Innovation Portfolio' }
    });

    if (digitalPortfolio && existingProjects.length >= 2) {
      await prisma.project.updateMany({
        where: {
          id: {
            in: [existingProjects[0].id, existingProjects[1].id]
          }
        },
        data: {
          portfolioId: digitalPortfolio.id
        }
      });
      console.log(`✅ Assigned 2 projects to Digital Innovation Portfolio`);
    }

    // Assign next 2 projects to Market Expansion Portfolio
    const marketPortfolio = await prisma.portfolio.findFirst({
      where: { name: 'Market Expansion Portfolio' }
    });

    if (marketPortfolio && existingProjects.length >= 4) {
      await prisma.project.updateMany({
        where: {
          id: {
            in: [existingProjects[2].id, existingProjects[3].id]
          }
        },
        data: {
          portfolioId: marketPortfolio.id
        }
      });
      console.log(`✅ Assigned 2 projects to Market Expansion Portfolio`);
    }

    // Assign last project to Customer Experience Innovation
    const cxPortfolio = await prisma.portfolio.findFirst({
      where: { name: 'Customer Experience Innovation' }
    });

    if (cxPortfolio && existingProjects.length >= 5) {
      await prisma.project.update({
        where: {
          id: existingProjects[4].id
        },
        data: {
          portfolioId: cxPortfolio.id
        }
      });
      console.log(`✅ Assigned 1 project to Customer Experience Innovation`);
    }
  }

  console.log('🎉 Portfolios seeded successfully!');
}

export default seedPortfolios;

// Run seeding if this file is executed directly
if (require.main === module) {
  seedPortfolios()
    .catch((e) => {
      console.error('❌ Error seeding portfolios:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}