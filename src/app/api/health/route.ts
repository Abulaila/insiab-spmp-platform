import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { quickHealthCheck, getStartupIssues } from '../../../lib/startup-checks';

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Perform quick health check
    const healthResult = await quickHealthCheck();
    const startupIssues = getStartupIssues();
    
    // Test database connection and get metrics
    const dbTestStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    const dbResponseTime = Date.now() - dbTestStart;
    
    const systemInfo = {
      status: healthResult.status === 'healthy' && !startupIssues ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        status: 'connected',
        responseTime: dbResponseTime,
        userCount
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      performance: {
        responseTime: Date.now() - startTime
      },
      startup: startupIssues ? {
        hasIssues: true,
        errors: startupIssues.errors,
        warnings: startupIssues.warnings,
        timestamp: startupIssues.timestamp
      } : {
        hasIssues: false,
        message: 'Startup completed successfully'
      },
      health: healthResult
    };

    const statusCode = systemInfo.status === 'healthy' ? 200 : 503;
    return NextResponse.json(systemInfo, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    
    const errorInfo = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        status: 'disconnected'
      }
    };

    return NextResponse.json(errorInfo, { status: 503 });
  }
}

export async function HEAD() {
  try {
    // Quick health check for HEAD requests (used by load balancers)
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}