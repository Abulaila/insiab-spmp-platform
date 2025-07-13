import { PrismaClient, ProjectMethodology, ProjectStatus, Priority } from '@prisma/client';

const prisma = new PrismaClient();

// Comprehensive seed data for 100+ realistic projects
const projectTemplates = [
  // Technology & Software Development
  {
    name: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI/UX, improved performance, and mobile optimization.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 65,
    budget: 250000,
    industry: 'Technology',
    tags: ['ecommerce', 'redesign', 'mobile', 'performance']
  },
  {
    name: 'AI-Powered Customer Support Bot',
    description: 'Development of intelligent chatbot system using natural language processing to handle customer inquiries automatically.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 40,
    budget: 180000,
    industry: 'Technology',
    tags: ['ai', 'chatbot', 'customer-support', 'nlp']
  },
  {
    name: 'Cloud Infrastructure Migration',
    description: 'Migrating legacy on-premise systems to cloud infrastructure for improved scalability and cost efficiency.',
    methodology: ProjectMethodology.WATERFALL,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 30,
    budget: 500000,
    industry: 'Technology',
    tags: ['cloud', 'migration', 'infrastructure', 'scalability']
  },
  {
    name: 'Mobile Banking App',
    description: 'Native mobile application for banking services with biometric authentication and real-time transaction monitoring.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.COMPLETED,
    priority: Priority.HIGH,
    progress: 100,
    budget: 320000,
    industry: 'FinTech',
    tags: ['mobile', 'banking', 'security', 'fintech']
  },
  {
    name: 'Data Analytics Dashboard',
    description: 'Interactive business intelligence dashboard for real-time data visualization and reporting across all departments.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 75,
    budget: 150000,
    industry: 'Analytics',
    tags: ['analytics', 'dashboard', 'bi', 'reporting']
  },

  // Marketing & Branding
  {
    name: 'Global Brand Identity Refresh',
    description: 'Comprehensive rebranding initiative including logo design, brand guidelines, and marketing material updates.',
    methodology: ProjectMethodology.WATERFALL,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 85,
    budget: 120000,
    industry: 'Marketing',
    tags: ['branding', 'design', 'identity', 'guidelines']
  },
  {
    name: 'Social Media Campaign Launch',
    description: 'Multi-platform social media marketing campaign for new product launch with influencer partnerships.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 55,
    budget: 80000,
    industry: 'Marketing',
    tags: ['social-media', 'campaign', 'influencer', 'launch']
  },
  {
    name: 'SEO Optimization Project',
    description: 'Comprehensive search engine optimization strategy to improve organic search rankings and website traffic.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 60,
    budget: 45000,
    industry: 'Marketing',
    tags: ['seo', 'optimization', 'traffic', 'ranking']
  },

  // Healthcare & Life Sciences
  {
    name: 'Telemedicine Platform Development',
    description: 'HIPAA-compliant telemedicine platform enabling remote consultations and patient management.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 70,
    budget: 400000,
    industry: 'Healthcare',
    tags: ['telemedicine', 'hipaa', 'healthcare', 'remote']
  },
  {
    name: 'Electronic Health Records System',
    description: 'Implementation of comprehensive EHR system for multi-location healthcare provider network.',
    methodology: ProjectMethodology.WATERFALL,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 45,
    budget: 750000,
    industry: 'Healthcare',
    tags: ['ehr', 'healthcare', 'records', 'system']
  },

  // Education & Training
  {
    name: 'Online Learning Platform',
    description: 'Interactive e-learning platform with video content, assessments, and progress tracking for corporate training.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 80,
    budget: 200000,
    industry: 'Education',
    tags: ['elearning', 'training', 'video', 'assessment']
  },
  {
    name: 'Student Information System',
    description: 'Comprehensive SIS for managing student records, grades, schedules, and communication with parents.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.COMPLETED,
    priority: Priority.MEDIUM,
    progress: 100,
    budget: 180000,
    industry: 'Education',
    tags: ['sis', 'student', 'grades', 'school']
  },

  // Manufacturing & Operations
  {
    name: 'Smart Factory IoT Implementation',
    description: 'Internet of Things deployment for real-time monitoring and optimization of manufacturing processes.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 35,
    budget: 600000,
    industry: 'Manufacturing',
    tags: ['iot', 'smart-factory', 'monitoring', 'optimization']
  },
  {
    name: 'Supply Chain Management System',
    description: 'End-to-end supply chain visibility and management platform with real-time tracking and analytics.',
    methodology: ProjectMethodology.WATERFALL,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 50,
    budget: 350000,
    industry: 'Manufacturing',
    tags: ['supply-chain', 'tracking', 'logistics', 'analytics']
  },

  // Real Estate & Construction
  {
    name: 'Property Management Portal',
    description: 'Digital platform for property managers to handle tenant communications, maintenance requests, and rent collection.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 65,
    budget: 140000,
    industry: 'Real Estate',
    tags: ['property', 'management', 'portal', 'tenants']
  },
  {
    name: 'Construction Project Tracking',
    description: 'Mobile-first application for tracking construction progress, managing subcontractors, and monitoring budgets.',
    methodology: ProjectMethodology.AGILE,
    status: 'on_hold' as ProjectStatus,
    priority: 'low' as Priority,
    progress: 25,
    budget: 95000,
    industry: 'Construction',
    tags: ['construction', 'tracking', 'mobile', 'budget']
  },

  // Retail & E-commerce
  {
    name: 'Inventory Management System',
    description: 'Real-time inventory tracking and management system with automated reordering and supplier integration.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 90,
    budget: 160000,
    industry: 'Retail',
    tags: ['inventory', 'tracking', 'automation', 'supplier']
  },
  {
    name: 'Customer Loyalty Program',
    description: 'Points-based loyalty program with mobile app integration and personalized rewards system.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.COMPLETED,
    priority: Priority.MEDIUM,
    progress: 100,
    budget: 110000,
    industry: 'Retail',
    tags: ['loyalty', 'rewards', 'mobile', 'personalization']
  },

  // Financial Services
  {
    name: 'Fraud Detection System',
    description: 'Machine learning-based fraud detection system for real-time transaction monitoring and risk assessment.',
    methodology: ProjectMethodology.AGILE,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 55,
    budget: 280000,
    industry: 'FinTech',
    tags: ['fraud', 'detection', 'ml', 'security']
  },
  {
    name: 'Investment Portfolio Dashboard',
    description: 'Interactive dashboard for investment portfolio management with real-time market data and analytics.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    progress: 70,
    budget: 195000,
    industry: 'FinTech',
    tags: ['investment', 'portfolio', 'dashboard', 'analytics']
  },

  // Government & Public Sector
  {
    name: 'Citizen Services Portal',
    description: 'Digital government services platform allowing citizens to access services, pay fees, and track applications online.',
    methodology: ProjectMethodology.WATERFALL,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 40,
    budget: 450000,
    industry: 'Government',
    tags: ['government', 'citizen', 'services', 'digital']
  },
  {
    name: 'Emergency Response System',
    description: 'Integrated emergency response and communication system for coordinating first responders and resources.',
    methodology: ProjectMethodology.HYBRID,
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    progress: 60,
    budget: 380000,
    industry: 'Government',
    tags: ['emergency', 'response', 'communication', 'coordination']
  }
];

// Additional project variations to reach 100+
const projectVariations = [
  'Phase 2', 'Mobile Version', 'API Integration', 'Security Enhancement', 'Performance Optimization',
  'International Expansion', 'Beta Testing', 'User Training', 'Documentation', 'Maintenance'
];

const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Government', 'Real Estate'];
const methodologies: ProjectMethodology[] = ['AGILE', 'WATERFALL', 'HYBRID'];
const statuses: ProjectStatus[] = ['ACTIVE', 'COMPLETED', 'ON_HOLD', 'PLANNING'];
const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomProgress(): number {
  return Math.floor(Math.random() * 100);
}

function getRandomBudget(): number {
  return Math.floor(Math.random() * 500000) + 50000; // $50k to $550k
}

function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateProjectTags(industry: string, baseTagsCount: number = 3): string[] {
  const industryTags = {
    Technology: ['tech', 'software', 'digital', 'automation', 'innovation', 'development'],
    Healthcare: ['medical', 'patient', 'clinical', 'health', 'wellness', 'treatment'],
    Finance: ['financial', 'banking', 'investment', 'payment', 'trading', 'compliance'],
    Education: ['learning', 'student', 'academic', 'curriculum', 'training', 'assessment'],
    Manufacturing: ['production', 'quality', 'efficiency', 'automation', 'maintenance', 'safety'],
    Retail: ['customer', 'sales', 'inventory', 'shopping', 'commerce', 'brand'],
    Government: ['public', 'civic', 'policy', 'administration', 'compliance', 'transparency'],
    'Real Estate': ['property', 'development', 'construction', 'leasing', 'investment', 'market']
  };

  const commonTags = ['project', 'management', 'implementation', 'optimization', 'integration', 'analysis'];
  const relevantTags = industryTags[industry as keyof typeof industryTags] || commonTags;
  
  const selectedTags = [];
  for (let i = 0; i < baseTagsCount; i++) {
    selectedTags.push(getRandomItem([...relevantTags, ...commonTags]));
  }
  
  return [...new Set(selectedTags)]; // Remove duplicates
}

export async function seedProjects() {
  console.log('🌱 Starting project seeding...');

  // First, ensure we have users to assign as creators
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('❌ No users found. Please run the main seed script first.');
    return;
  }

  const projects = [];

  // Create base projects from templates
  for (const template of projectTemplates) {
    const startDate = getRandomDate(new Date('2024-01-01'), new Date('2024-12-31'));
    const dueDate = new Date(startDate.getTime() + (Math.random() * 180 + 30) * 24 * 60 * 60 * 1000); // 30-210 days

    projects.push({
      ...template,
      startDate,
      dueDate,
      createdBy: getRandomItem(users).id,
      tags: generateProjectTags(template.industry)
    });
  }

  // Generate additional variations to reach 100+ projects
  while (projects.length < 120) {
    const baseProject = getRandomItem(projectTemplates);
    const variation = getRandomItem(projectVariations);
    const industry = getRandomItem(industries);
    
    const startDate = getRandomDate(new Date('2024-01-01'), new Date('2024-12-31'));
    const dueDate = new Date(startDate.getTime() + (Math.random() * 180 + 30) * 24 * 60 * 60 * 1000);

    projects.push({
      name: `${baseProject.name} - ${variation}`,
      description: `${variation} for ${baseProject.description}`,
      methodology: getRandomItem(methodologies),
      status: getRandomItem(statuses),
      priority: getRandomItem(priorities),
      progress: getRandomProgress(),
      startDate,
      dueDate,
      budget: getRandomBudget(),
      createdBy: getRandomItem(users).id,
      tags: generateProjectTags(industry),
      industry
    });
  }

  console.log(`📊 Creating ${projects.length} projects...`);

  // Create projects in batches to avoid timeout
  const batchSize = 20;
  for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (projectData) => {
      try {
        const project = await prisma.project.create({
          data: {
            name: projectData.name,
            description: projectData.description,
            methodology: projectData.methodology,
            status: projectData.status,
            priority: projectData.priority,
            progress: projectData.progress,
            startDate: projectData.startDate,
            dueDate: projectData.dueDate,
            budget: projectData.budget,
            createdBy: projectData.createdBy,
            tags: {
              create: projectData.tags.map(tag => ({ tag }))
            }
          }
        });

        // Assign random team members (1-5 per project)
        const teamSize = Math.floor(Math.random() * 5) + 1;
        const randomUsers = users.sort(() => 0.5 - Math.random()).slice(0, teamSize);
        
        await Promise.all(randomUsers.map(user => 
          prisma.projectTeamMember.create({
            data: {
              projectId: project.id,
              userId: user.id
            }
          })
        ));

      } catch (error) {
        console.error(`Failed to create project: ${projectData.name}`, error);
      }
    }));

    console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(projects.length / batchSize)}`);
  }

  const totalProjects = await prisma.project.count();
  console.log(`🎉 Successfully created ${totalProjects} projects!`);
}

if (require.main === module) {
  seedProjects()
    .catch((e) => {
      console.error('❌ Error seeding projects:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}