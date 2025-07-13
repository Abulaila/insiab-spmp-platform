import { PrismaClient, ProjectStatus, Priority, ProjectMethodology, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedTasks() {
  try {
    console.log('Starting task seeding...');

    // Get existing users for assignment
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      console.log('No users found. Creating sample users first...');
      
      // Create sample users
      const sampleUsers = await Promise.all([
        prisma.user.create({
          data: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'PROJECT_MANAGER',
            avatar: null,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'DEVELOPER',
            avatar: null,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Carol Williams',
            email: 'carol@example.com',
            role: 'DESIGNER',
            avatar: null,
          },
        }),
        prisma.user.create({
          data: {
            name: 'David Brown',
            email: 'david@example.com',
            role: 'QA_ENGINEER',
            avatar: null,
          },
        }),
      ]);
      
      users.push(...sampleUsers);
    }

    // Get existing projects for assignment
    const projects = await prisma.project.findMany();
    if (projects.length === 0) {
      console.log('No projects found. Creating sample project first...');
      
      const sampleProject = await prisma.project.create({
        data: {
          name: 'Task Management System',
          description: 'Development of a comprehensive task management system',
          status: ProjectStatus.ACTIVE,
          priority: Priority.HIGH,
          methodology: ProjectMethodology.AGILE,
          startDate: new Date('2024-01-01'),
          dueDate: new Date('2024-12-31'),
          budget: 100000,
          progress: 45,
          createdBy: users[0].id,
        },
      });
      
      projects.push(sampleProject);
    }

    // Sample task data
    const sampleTasks = [
      {
        title: 'Design user authentication flow',
        description: 'Create wireframes and mockups for user login, registration, and password reset flows',
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        progress: 100,
        startDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-01'),
        estimatedHours: 16,
        actualHours: 18,
        completedAt: new Date('2024-02-01'),
        projectId: projects[0].id,
        assigneeId: users[2].id, // Carol (Designer)
        createdBy: users[0].id, // Alice (PM)
        tags: ['design', 'authentication', 'ui/ux']
      },
      {
        title: 'Implement REST API endpoints',
        description: 'Develop RESTful API endpoints for user management, project CRUD operations, and task management',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        progress: 75,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-15'),
        estimatedHours: 40,
        actualHours: 32,
        projectId: projects[0].id,
        assigneeId: users[1].id, // Bob (Developer)
        createdBy: users[0].id,
        tags: ['backend', 'api', 'development']
      },
      {
        title: 'Set up database schema',
        description: 'Design and implement the database schema with proper relationships and indexes',
        status: TaskStatus.COMPLETED,
        priority: 'urgent',
        progress: 100,
        startDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-05'),
        estimatedHours: 24,
        actualHours: 20,
        completedAt: new Date('2024-02-03'),
        projectId: projects[0].id,
        assigneeId: users[1].id, // Bob (Developer)
        createdBy: users[0].id,
        tags: ['database', 'schema', 'backend']
      },
      {
        title: 'Create task management interface',
        description: 'Build the frontend interface for creating, editing, and managing tasks with multiple view modes',
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.MEDIUM,
        progress: 60,
        startDate: new Date('2024-02-15'),
        dueDate: new Date('2024-04-01'),
        estimatedHours: 50,
        actualHours: 35,
        projectId: projects[0].id,
        assigneeId: users[2].id, // Carol (Designer)
        createdBy: users[0].id,
        tags: ['frontend', 'ui', 'tasks', 'kanban']
      },
      {
        title: 'Write unit tests for API',
        description: 'Comprehensive unit testing for all API endpoints with edge cases and error handling',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.MEDIUM,
        progress: 0,
        startDate: new Date('2024-03-01'),
        dueDate: new Date('2024-03-20'),
        estimatedHours: 30,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: users[3].id, // David (QA)
        createdBy: users[0].id,
        tags: ['testing', 'api', 'quality-assurance']
      },
      {
        title: 'Implement real-time notifications',
        description: 'Add WebSocket support for real-time task updates and notifications',
        status: TaskStatus.BLOCKED,
        priority: Priority.LOW,
        progress: 10,
        startDate: new Date('2024-03-15'),
        dueDate: new Date('2024-04-15'),
        estimatedHours: 25,
        actualHours: 3,
        projectId: projects[0].id,
        assigneeId: users[1].id, // Bob (Developer)
        createdBy: users[0].id,
        tags: ['websocket', 'realtime', 'notifications']
      },
      {
        title: 'Performance optimization review',
        description: 'Analyze and optimize application performance, including database queries and frontend rendering',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.MEDIUM,
        progress: 0,
        startDate: new Date('2024-04-01'),
        dueDate: new Date('2024-04-20'),
        estimatedHours: 20,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: users[1].id, // Bob (Developer)
        createdBy: users[0].id,
        tags: ['performance', 'optimization', 'review']
      },
      {
        title: 'Security audit and penetration testing',
        description: 'Comprehensive security review including authentication, authorization, and data protection',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.HIGH,
        progress: 0,
        startDate: new Date('2024-04-15'),
        dueDate: new Date('2024-05-01'),
        estimatedHours: 35,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: users[3].id, // David (QA)
        createdBy: users[0].id,
        tags: ['security', 'audit', 'penetration-testing']
      },
      {
        title: 'User documentation and help system',
        description: 'Create comprehensive user documentation, tutorials, and in-app help system',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.LOW,
        progress: 0,
        startDate: new Date('2024-05-01'),
        dueDate: new Date('2024-05-30'),
        estimatedHours: 40,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: users[2].id, // Carol (Designer)
        createdBy: users[0].id,
        tags: ['documentation', 'help', 'user-guide']
      },
      {
        title: 'Mobile responsive design',
        description: 'Ensure the application is fully responsive and works well on mobile devices',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.MEDIUM,
        progress: 0,
        startDate: new Date('2024-03-20'),
        dueDate: new Date('2024-04-10'),
        estimatedHours: 28,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: users[2].id, // Carol (Designer)
        createdBy: users[0].id,
        tags: ['mobile', 'responsive', 'design']
      },
      // Overdue task for testing
      {
        title: 'Fix critical bug in authentication',
        description: 'Emergency fix for authentication bypass vulnerability discovered in security review',
        status: TaskStatus.IN_PROGRESS,
        priority: 'urgent',
        progress: 80,
        startDate: new Date('2024-01-10'),
        dueDate: new Date('2024-01-12'), // Overdue
        estimatedHours: 8,
        actualHours: 12,
        projectId: projects[0].id,
        assigneeId: users[1].id, // Bob (Developer)
        createdBy: users[0].id,
        tags: ['bug', 'security', 'urgent', 'authentication']
      },
      // Unassigned task
      {
        title: 'Research integration options',
        description: 'Research and evaluate potential third-party integrations for project management',
        status: TaskStatus.NOT_STARTED,
        priority: Priority.LOW,
        progress: 0,
        startDate: new Date('2024-04-01'),
        dueDate: new Date('2024-04-30'),
        estimatedHours: 15,
        actualHours: 0,
        projectId: projects[0].id,
        assigneeId: null, // Unassigned
        createdBy: users[0].id,
        tags: ['research', 'integration', 'evaluation']
      }
    ];

    console.log('Creating tasks...');
    const createdTasks = [];

    for (const taskData of sampleTasks) {
      const { tags, ...taskWithoutTags } = taskData;
      
      const task = await prisma.task.create({
        data: {
          ...taskWithoutTags,
          tags: {
            create: tags.map(tag => ({ tag }))
          }
        },
        include: {
          tags: true,
          assignee: true,
          creator: true,
          project: true
        }
      });
      
      createdTasks.push(task);
      console.log(`Created task: ${task.title}`);
    }

    // Create some subtasks
    console.log('Creating subtasks...');
    
    const parentTask = createdTasks.find(t => t.title === 'Create task management interface');
    if (parentTask) {
      const subtasks = [
        {
          title: 'Design task card component',
          description: 'Create reusable task card component for different views',
          status: TaskStatus.COMPLETED,
          priority: Priority.MEDIUM,
          progress: 100,
          startDate: new Date('2024-02-16'),
          dueDate: new Date('2024-02-20'),
          estimatedHours: 8,
          actualHours: 6,
          completedAt: new Date('2024-02-19'),
          projectId: projects[0].id,
          assigneeId: users[2].id,
          createdBy: users[0].id,
          parentTaskId: parentTask.id
        },
        {
          title: 'Implement drag and drop functionality',
          description: 'Add drag and drop support for kanban board',
          status: TaskStatus.IN_PROGRESS,
          priority: Priority.MEDIUM,
          progress: 70,
          startDate: new Date('2024-02-20'),
          dueDate: new Date('2024-03-05'),
          estimatedHours: 12,
          actualHours: 10,
          projectId: projects[0].id,
          assigneeId: users[1].id,
          createdBy: users[0].id,
          parentTaskId: parentTask.id
        },
        {
          title: 'Add task filtering and sorting',
          description: 'Implement advanced filtering and sorting options',
          status: TaskStatus.NOT_STARTED,
          priority: Priority.LOW,
          progress: 0,
          startDate: new Date('2024-03-01'),
          dueDate: new Date('2024-03-15'),
          estimatedHours: 10,
          actualHours: 0,
          projectId: projects[0].id,
          assigneeId: users[2].id,
          createdBy: users[0].id,
          parentTaskId: parentTask.id
        }
      ];

      for (const subtaskData of subtasks) {
        const subtask = await prisma.task.create({
          data: {
            ...subtaskData,
            tags: {
              create: [{ tag: 'subtask' }, { tag: 'frontend' }]
            }
          },
          include: {
            tags: true,
            assignee: true,
            creator: true,
            project: true,
            parentTask: true
          }
        });
        
        console.log(`Created subtask: ${subtask.title}`);
      }
    }

    // Create task dependencies
    console.log('Creating task dependencies...');
    
    const apiTask = createdTasks.find(t => t.title === 'Implement REST API endpoints');
    const schemaTask = createdTasks.find(t => t.title === 'Set up database schema');
    const testingTask = createdTasks.find(t => t.title === 'Write unit tests for API');
    
    if (apiTask && schemaTask) {
      await prisma.taskDependency.create({
        data: {
          dependentTaskId: apiTask.id,
          blockingTaskId: schemaTask.id
        }
      });
      console.log('Created dependency: API depends on schema');
    }
    
    if (testingTask && apiTask) {
      await prisma.taskDependency.create({
        data: {
          dependentTaskId: testingTask.id,
          blockingTaskId: apiTask.id
        }
      });
      console.log('Created dependency: Testing depends on API');
    }

    // Create some task comments
    console.log('Creating task comments...');
    
    const commentsData = [
      {
        taskId: apiTask?.id,
        content: 'Started working on the user authentication endpoints. Making good progress.',
        createdBy: users[1].id
      },
      {
        taskId: apiTask?.id,
        content: 'Please make sure to include proper error handling for all edge cases.',
        createdBy: users[0].id
      },
      {
        taskId: parentTask?.id,
        content: 'The design mockups look great! Ready to start implementation.',
        createdBy: users[1].id
      },
      {
        taskId: createdTasks.find(t => t.title === 'Fix critical bug in authentication')?.id,
        content: 'This is blocking the production deployment. High priority fix needed.',
        createdBy: users[0].id
      }
    ];

    for (const commentData of commentsData) {
      if (commentData.taskId) {
        await prisma.taskComment.create({
          data: commentData
        });
      }
    }

    console.log(`Task seeding completed successfully!`);
    console.log(`Created ${createdTasks.length} main tasks with subtasks, dependencies, and comments.`);

  } catch (error) {
    console.error('Error seeding tasks:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedTasks()
    .then(() => {
      console.log('Task seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Task seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}