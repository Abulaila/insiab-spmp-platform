import { z } from 'zod';

// Define the expected environment variables schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required').optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Optional API keys and external services
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Optional monitoring and logging
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Optional feature flags
  ENABLE_ANALYTICS: z.string().optional().default('true').transform(val => val === 'true'),
  ENABLE_AI_FEATURES: z.string().optional().default('true').transform(val => val === 'true'),
  ENABLE_OFFLINE_MODE: z.string().optional().default('true').transform(val => val === 'true'),
});

export type EnvConfig = z.infer<typeof envSchema>;

interface ValidationResult {
  success: boolean;
  config?: EnvConfig;
  errors?: string[];
  warnings?: string[];
}

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Parse and validate environment variables
    const config = envSchema.parse(process.env);
    
    // Additional custom validations
    if (config.NODE_ENV === 'production') {
      if (!process.env.NEXTAUTH_SECRET) {
        errors.push('NEXTAUTH_SECRET is required in production');
      }
      if (!process.env.NEXTAUTH_URL) {
        warnings.push('NEXTAUTH_URL should be set in production');
      }
      if (config.DATABASE_URL.includes('localhost') || config.DATABASE_URL.includes('127.0.0.1')) {
        warnings.push('Using local database in production environment');
      }
    }
    
    // Check database URL format
    if (!config.DATABASE_URL.startsWith('file:') && 
        !config.DATABASE_URL.startsWith('postgresql:') && 
        !config.DATABASE_URL.startsWith('mysql:') &&
        !config.DATABASE_URL.startsWith('sqlite:')) {
      errors.push('DATABASE_URL must be a valid database connection string');
    }
    
    // Warn about missing optional but recommended configs
    if (config.NODE_ENV === 'production' && !process.env.SENTRY_DSN) {
      warnings.push('SENTRY_DSN not configured - error tracking disabled');
    }
    
    if (config.ENABLE_AI_FEATURES && !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      warnings.push('AI features enabled but no AI API keys configured');
    }
    
    return {
      success: errors.length === 0,
      config,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErrors = error.issues.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      );
      return {
        success: false,
        errors: zodErrors
      };
    }
    
    return {
      success: false,
      errors: [`Environment validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

export function getValidatedEnv(): EnvConfig {
  const result = validateEnvironment();
  
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    result.errors?.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid environment configuration');
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('✅ Environment validation passed');
  return result.config!;
}

// Utility to check if a feature is enabled
export function isFeatureEnabled(feature: keyof Pick<EnvConfig, 'ENABLE_ANALYTICS' | 'ENABLE_AI_FEATURES' | 'ENABLE_OFFLINE_MODE'>): boolean {
  const config = getValidatedEnv();
  return config[feature];
}

// Runtime environment checker
export function checkRuntimeEnvironment(): {
  isServer: boolean;
  isClient: boolean;
  isBrowser: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  hasLocalStorage: boolean;
  hasServiceWorker: boolean;
} {
  return {
    isServer: typeof window === 'undefined',
    isClient: typeof window !== 'undefined',
    isBrowser: typeof window !== 'undefined' && typeof document !== 'undefined',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    hasLocalStorage: typeof window !== 'undefined' && typeof window.localStorage !== 'undefined',
    hasServiceWorker: typeof window !== 'undefined' && 'serviceWorker' in navigator
  };
}

// Health check for environment setup
export async function performEnvironmentHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  checks: Array<{
    name: string;
    status: 'pass' | 'warn' | 'fail';
    message: string;
  }>;
}> {
  const checks = [];
  let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
  
  // Check environment validation
  const envResult = validateEnvironment();
  checks.push({
    name: 'Environment Variables',
    status: envResult.success ? 'pass' : 'fail',
    message: envResult.success 
      ? 'All required environment variables are present'
      : `Missing or invalid: ${envResult.errors?.join(', ')}`
  });
  
  if (!envResult.success) overallStatus = 'error';
  if (envResult.warnings && envResult.warnings.length > 0) {
    if (overallStatus === 'healthy') overallStatus = 'warning';
    checks.push({
      name: 'Environment Warnings',
      status: 'warn',
      message: envResult.warnings.join(', ')
    });
  }
  
  // Check database connectivity
  try {
    const { prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    checks.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Database is accessible'
    });
  } catch (error) {
    checks.push({
      name: 'Database Connection',
      status: 'fail',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    overallStatus = 'error';
  }
  
  // Check filesystem permissions (for file uploads, etc.)
  if (typeof process !== 'undefined') {
    try {
      const fs = await import('fs/promises');
      const tmpPath = '/tmp/health-check';
      await fs.writeFile(tmpPath, 'test');
      await fs.unlink(tmpPath);
      checks.push({
        name: 'Filesystem Access',
        status: 'pass',
        message: 'Filesystem is writable'
      });
    } catch (error) {
      checks.push({
        name: 'Filesystem Access',
        status: 'warn',
        message: 'Filesystem write test failed'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  }
  
  // Check runtime environment
  const runtime = checkRuntimeEnvironment();
  checks.push({
    name: 'Runtime Environment',
    status: 'pass',
    message: `Running in ${runtime.isDevelopment ? 'development' : 'production'} mode`
  });
  
  return {
    status: overallStatus,
    checks
  };
}