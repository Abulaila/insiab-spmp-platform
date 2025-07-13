import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedBoardTemplates() {
  console.log('🎯 Seeding board templates...');

  // Get the default admin user
  const adminUser = await prisma.user.findUnique({
    where: { id: 'default-admin-user' }
  });

  if (!adminUser) {
    console.error('❌ Default admin user not found. Run main seed first.');
    return;
  }

  // Project Management Institute (PMI) Standard Template
  const pmiTemplate = await prisma.boardTemplate.upsert({
    where: { 
      id: 'pmi-project-lifecycle-template'
    },
    update: {},
    create: {
      id: 'pmi-project-lifecycle-template',
      name: 'PMI Project Lifecycle',
      description: 'Standard project management lifecycle based on PMI/PMBOK best practices',
      category: 'project_management',
      methodology: 'pmbok',
      isPublic: true,
      createdBy: adminUser.id,
      columns: [
        {
          name: 'Initiation',
          color: '#8b5cf6',
          icon: '🎯',
          order: 0,
          statusMapping: 'active',
          description: 'Project charter, stakeholder identification, initial scope'
        },
        {
          name: 'Planning',
          color: '#3b82f6',
          icon: '📝',
          order: 1,
          statusMapping: 'active',
          description: 'Detailed planning, resource allocation, timeline creation'
        },
        {
          name: 'Execution',
          color: '#10b981',
          icon: '⚡',
          order: 2,
          statusMapping: 'active',
          description: 'Active development and implementation'
        },
        {
          name: 'Monitoring & Control',
          color: '#f59e0b',
          icon: '📊',
          order: 3,
          statusMapping: 'active',
          description: 'Progress tracking, quality control, risk management'
        },
        {
          name: 'Blocked',
          color: '#ef4444',
          icon: '🚨',
          order: 4,
          statusMapping: 'blocked',
          description: 'Issues requiring resolution before proceeding'
        },
        {
          name: 'Closure',
          color: '#6366f1',
          icon: '✅',
          order: 5,
          statusMapping: 'completed',
          description: 'Project completion, lessons learned, handover'
        }
      ],
      settings: {
        enableWipLimits: true,
        defaultWipLimit: 5,
        theme: 'professional',
        showProgressBars: true,
        showTeamAvatars: true,
        allowColumnCustomization: true
      }
    }
  });

  // Agile/Scrum Template
  const agileTemplate = await prisma.boardTemplate.upsert({
    where: { id: 'agile-scrum-board-template' },
    update: {},
    create: {
      id: 'agile-scrum-board-template',
      name: 'Agile Scrum Board',
      description: 'Agile development workflow with sprint-based delivery',
      category: 'software_development',
      methodology: 'agile',
      isPublic: true,
      createdBy: adminUser.id,
      columns: [
        {
          name: 'Product Backlog',
          color: '#64748b',
          icon: '📋',
          order: 0,
          statusMapping: 'active',
          description: 'Prioritized list of features and requirements'
        },
        {
          name: 'Sprint Planning',
          color: '#3b82f6',
          icon: '🎯',
          order: 1,
          statusMapping: 'active',
          description: 'Items selected for current sprint'
        },
        {
          name: 'In Progress',
          color: '#f59e0b',
          icon: '⚡',
          order: 2,
          statusMapping: 'active',
          description: 'Active development work',
          maxWipLimit: 3
        },
        {
          name: 'Code Review',
          color: '#8b5cf6',
          icon: '👀',
          order: 3,
          statusMapping: 'active',
          description: 'Peer review and quality assurance',
          maxWipLimit: 2
        },
        {
          name: 'Testing',
          color: '#06b6d4',
          icon: '🧪',
          order: 4,
          statusMapping: 'active',
          description: 'Quality assurance and testing',
          maxWipLimit: 3
        },
        {
          name: 'Done',
          color: '#10b981',
          icon: '✅',
          order: 5,
          statusMapping: 'completed',
          description: 'Completed and deployed features'
        }
      ],
      settings: {
        enableWipLimits: true,
        defaultWipLimit: 3,
        theme: 'agile',
        showProgressBars: true,
        showTeamAvatars: true,
        allowColumnCustomization: true,
        sprintBased: true
      }
    }
  });

  // Waterfall Template
  const waterfallTemplate = await prisma.boardTemplate.upsert({
    where: { id: 'waterfall-project-template' },
    update: {},
    create: {
      id: 'waterfall-project-template',
      name: 'Waterfall Project Management',
      description: 'Sequential project phases with gate approvals',
      category: 'project_management',
      methodology: 'waterfall',
      isPublic: true,
      createdBy: adminUser.id,
      columns: [
        {
          name: 'Requirements',
          color: '#8b5cf6',
          icon: '📋',
          order: 0,
          statusMapping: 'active',
          description: 'Requirements gathering and documentation'
        },
        {
          name: 'Design',
          color: '#3b82f6',
          icon: '🎨',
          order: 1,
          statusMapping: 'active',
          description: 'System and detailed design phase'
        },
        {
          name: 'Implementation',
          color: '#10b981',
          icon: '⚡',
          order: 2,
          statusMapping: 'active',
          description: 'Development and construction phase'
        },
        {
          name: 'Testing',
          color: '#f59e0b',
          icon: '🧪',
          order: 3,
          statusMapping: 'active',
          description: 'System testing and validation'
        },
        {
          name: 'Deployment',
          color: '#06b6d4',
          icon: '🚀',
          order: 4,
          statusMapping: 'active',
          description: 'Production deployment and rollout'
        },
        {
          name: 'Maintenance',
          color: '#6366f1',
          icon: '🔧',
          order: 5,
          statusMapping: 'completed',
          description: 'Ongoing support and maintenance'
        }
      ],
      settings: {
        enableWipLimits: false,
        theme: 'corporate',
        showProgressBars: true,
        showTeamAvatars: true,
        allowColumnCustomization: false,
        gateApprovals: true
      }
    }
  });

  // Lean Startup Template
  const leanTemplate = await prisma.boardTemplate.upsert({
    where: { id: 'lean-startup-canvas-template' },
    update: {},
    create: {
      id: 'lean-startup-canvas-template',
      name: 'Lean Startup Canvas',
      description: 'Build-Measure-Learn cycle for rapid iteration',
      category: 'product_development',
      methodology: 'lean',
      isPublic: true,
      createdBy: adminUser.id,
      columns: [
        {
          name: 'Ideas',
          color: '#8b5cf6',
          icon: '💡',
          order: 0,
          statusMapping: 'active',
          description: 'New feature ideas and hypotheses'
        },
        {
          name: 'Build',
          color: '#3b82f6',
          icon: '🔨',
          order: 1,
          statusMapping: 'active',
          description: 'Minimum viable products and experiments'
        },
        {
          name: 'Measure',
          color: '#f59e0b',
          icon: '📊',
          order: 2,
          statusMapping: 'active',
          description: 'Data collection and metrics analysis'
        },
        {
          name: 'Learn',
          color: '#10b981',
          icon: '🎓',
          order: 3,
          statusMapping: 'active',
          description: 'Insights and validated learning'
        },
        {
          name: 'Pivot/Persevere',
          color: '#ef4444',
          icon: '🔄',
          order: 4,
          statusMapping: 'active',
          description: 'Decision point for iteration or pivot'
        },
        {
          name: 'Scale',
          color: '#06b6d4',
          icon: '📈',
          order: 5,
          statusMapping: 'completed',
          description: 'Successful features ready for scaling'
        }
      ],
      settings: {
        enableWipLimits: true,
        defaultWipLimit: 2,
        theme: 'startup',
        showProgressBars: false,
        showTeamAvatars: true,
        allowColumnCustomization: true,
        rapidIteration: true
      }
    }
  });

  console.log('✅ Board templates created:');
  console.log(`   📊 ${pmiTemplate.name}`);
  console.log(`   ⚡ ${agileTemplate.name}`);
  console.log(`   🌊 ${waterfallTemplate.name}`);
  console.log(`   💡 ${leanTemplate.name}`);

  return { pmiTemplate, agileTemplate, waterfallTemplate, leanTemplate };
}

export default seedBoardTemplates;

// Run if called directly
if (require.main === module) {
  seedBoardTemplates()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}