import { validateEnvironment, performEnvironmentHealthCheck } from './env-validation';

interface StartupCheckResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  timestamp: string;
}

export async function performStartupChecks(): Promise<StartupCheckResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  console.log('🚀 Performing startup checks...');
  
  try {
    // 1. Validate environment variables
    console.log('📋 Checking environment variables...');
    const envResult = validateEnvironment();
    
    if (!envResult.success) {
      errors.push(...(envResult.errors || []));
    }
    if (envResult.warnings) {
      warnings.push(...envResult.warnings);
    }
    
    // 2. Perform comprehensive health check
    console.log('🏥 Performing health checks...');
    const healthResult = await performEnvironmentHealthCheck();
    
    healthResult.checks.forEach(check => {
      if (check.status === 'fail') {
        errors.push(`${check.name}: ${check.message}`);
      } else if (check.status === 'warn') {
        warnings.push(`${check.name}: ${check.message}`);
      }
    });
    
    // 3. Check Prisma client
    console.log('🗄️  Checking database client...');
    try {
      const { prisma } = await import('./prisma');
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database client ready');
    } catch (error) {
      errors.push(`Database client error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // 4. Verify critical directories exist (server-side only)
    if (typeof process !== 'undefined') {
      console.log('📁 Checking critical directories...');
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const criticalDirs = [
          path.join(process.cwd(), 'prisma'),
          path.join(process.cwd(), 'public'),
          path.join(process.cwd(), 'src')
        ];
        
        for (const dir of criticalDirs) {
          try {
            await fs.access(dir);
          } catch {
            errors.push(`Critical directory missing: ${dir}`);
          }
        }
      } catch (error) {
        warnings.push('Could not verify directory structure');
      }
    }
    
    // 5. Check for common configuration issues
    console.log('⚙️  Checking configuration...');
    
    // Check if we're in development with production database
    if (process.env.NODE_ENV === 'development' && 
        process.env.DATABASE_URL && 
        !process.env.DATABASE_URL.includes('localhost') && 
        !process.env.DATABASE_URL.includes('127.0.0.1') &&
        !process.env.DATABASE_URL.includes('file:')) {
      warnings.push('Development mode using remote database');
    }
    
    // Check Next.js configuration
    try {
      const nextConfig = await import('../../next.config');
      if (nextConfig.default?.typescript?.ignoreBuildErrors) {
        warnings.push('TypeScript build errors are being ignored');
      }
      if (nextConfig.default?.eslint?.ignoreDuringBuilds) {
        warnings.push('ESLint errors are being ignored during builds');
      }
    } catch {
      // next.config might not exist or be importable, which is fine
    }
    
    const result: StartupCheckResult = {
      success: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    };
    
    // Log results
    if (result.success) {
      console.log('✅ All startup checks passed');
      if (warnings.length > 0) {
        console.log('⚠️  Warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
      }
    } else {
      console.error('❌ Startup checks failed:');
      errors.forEach(error => console.error(`   ${error}`));
      if (warnings.length > 0) {
        console.log('⚠️  Additional warnings:');
        warnings.forEach(warning => console.log(`   ${warning}`));
      }
    }
    
    return result;
    
  } catch (error) {
    const errorMessage = `Startup check system failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error('💥', errorMessage);
    
    return {
      success: false,
      errors: [errorMessage],
      warnings,
      timestamp: new Date().toISOString()
    };
  }
}

// Quick health check for API endpoints
export async function quickHealthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; message: string }> {
  try {
    // Check database connection
    const { prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    
    return {
      status: 'healthy',
      message: 'All systems operational'
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `System check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

// Initialize startup checks (called during app startup)
export async function initializeApplication(): Promise<void> {
  try {
    const result = await performStartupChecks();
    
    if (!result.success) {
      // In production, we might want to exit the process
      if (process.env.NODE_ENV === 'production') {
        console.error('🚨 Critical startup errors detected in production');
        console.error('Consider fixing these issues before deployment:');
        result.errors.forEach(error => console.error(`   - ${error}`));
      }
      
      // Store startup issues for monitoring
      global.__STARTUP_ISSUES__ = result;
    } else {
      console.log('🎉 Application initialized successfully');
      global.__STARTUP_ISSUES__ = null;
    }
    
  } catch (error) {
    console.error('💥 Failed to initialize application:', error);
    global.__STARTUP_ISSUES__ = {
      success: false,
      errors: [`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      timestamp: new Date().toISOString()
    };
  }
}

// Get startup issues (for error reporting)
export function getStartupIssues(): StartupCheckResult | null {
  return (global as any).__STARTUP_ISSUES__ || null;
}