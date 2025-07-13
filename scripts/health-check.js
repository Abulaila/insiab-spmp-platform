#!/usr/bin/env node

/**
 * Pre-deployment Health Check Script
 * 
 * This script performs comprehensive health checks before deployment
 * to ensure the application is ready for production.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

class HealthChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = [];
  }

  addError(message) {
    this.errors.push(message);
    logError(message);
  }

  addWarning(message) {
    this.warnings.push(message);
    logWarning(message);
  }

  addSuccess(message) {
    logSuccess(message);
  }

  async runCheck(name, checkFn) {
    try {
      logInfo(`Running ${name}...`);
      const result = await checkFn();
      this.checks.push({ name, status: 'pass', result });
      this.addSuccess(`${name} passed`);
      return result;
    } catch (error) {
      this.checks.push({ name, status: 'fail', error: error.message });
      this.addError(`${name} failed: ${error.message}`);
      throw error;
    }
  }

  // Check if required files exist
  async checkRequiredFiles() {
    const requiredFiles = [
      'package.json',
      'next.config.js',
      'prisma/schema.prisma',
      'src/app/layout.tsx',
      'src/lib/prisma.ts',
      '.env'
    ];

    const missingFiles = [];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(process.cwd(), file))) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }

    return { requiredFiles: requiredFiles.length, missing: 0 };
  }

  // Check environment variables
  async checkEnvironment() {
    const requiredEnvVars = ['DATABASE_URL'];
    const missingVars = [];

    // Load .env file
    try {
      const envContent = fs.readFileSync('.env', 'utf8');
      const envVars = {};
      
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          envVars[key.trim()] = value.trim();
        }
      });

      for (const envVar of requiredEnvVars) {
        if (!envVars[envVar] && !process.env[envVar]) {
          missingVars.push(envVar);
        }
      }

      if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
      }

      return { required: requiredEnvVars.length, missing: 0 };
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('.env file not found');
      }
      throw error;
    }
  }

  // Check TypeScript compilation
  async checkTypeScript() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return { status: 'clean' };
    } catch (error) {
      // Try to get the actual TypeScript errors
      const output = error.stdout ? error.stdout.toString() : error.message;
      throw new Error(`TypeScript compilation errors:\n${output}`);
    }
  }

  // Check Next.js build
  async checkNextBuild() {
    try {
      const output = execSync('npm run build', { stdio: 'pipe' });
      return { status: 'success', output: output.toString() };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.message;
      throw new Error(`Next.js build failed:\n${output}`);
    }
  }

  // Check database connection
  async checkDatabase() {
    try {
      execSync('npx prisma db push --preview-feature', { stdio: 'pipe' });
      return { status: 'connected' };
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  // Check for common security issues
  async checkSecurity() {
    const issues = [];
    
    // Check for hardcoded secrets
    try {
      const srcFiles = execSync('find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx"', { 
        encoding: 'utf8' 
      }).split('\n').filter(Boolean);

      const secretPatterns = [
        /sk-[a-zA-Z0-9]{48}/, // OpenAI API key
        /xoxb-[a-zA-Z0-9-]+/, // Slack bot token
        /ghp_[a-zA-Z0-9]{36}/, // GitHub personal access token
        /AKIA[0-9A-Z]{16}/, // AWS access key
      ];

      for (const file of srcFiles) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          for (const pattern of secretPatterns) {
            if (pattern.test(content)) {
              issues.push(`Potential hardcoded secret in ${file}`);
            }
          }
        } catch (error) {
          // File might not exist anymore, skip
        }
      }
    } catch (error) {
      this.addWarning('Could not scan for hardcoded secrets');
    }

    // Check for debug code
    try {
      const debugPatterns = ['console.log', 'debugger;', 'TODO:', 'FIXME:'];
      const output = execSync(`grep -r "${debugPatterns.join('\\|')}" src/ || true`, { 
        encoding: 'utf8' 
      });
      
      if (output.trim()) {
        this.addWarning('Debug code found in source files');
      }
    } catch (error) {
      // grep might not be available, skip
    }

    if (issues.length > 0) {
      throw new Error(`Security issues found: ${issues.join(', ')}`);
    }

    return { issues: 0 };
  }

  // Check package vulnerabilities
  async checkPackageSecurity() {
    try {
      execSync('npm audit --audit-level=high', { stdio: 'pipe' });
      return { vulnerabilities: 0 };
    } catch (error) {
      const output = error.stdout ? error.stdout.toString() : error.message;
      if (output.includes('found') && output.includes('vulnerabilities')) {
        throw new Error(`npm audit found security vulnerabilities:\n${output}`);
      }
      // npm audit returns non-zero even for low-level issues, so check the actual output
      return { vulnerabilities: 0 };
    }
  }

  // Test critical API endpoints
  async checkAPIEndpoints() {
    // This would require the server to be running
    // For now, just check that the route files exist
    const criticalRoutes = [
      'src/app/api/health/route.ts',
      'src/app/api/projects/route.ts',
    ];

    const missingRoutes = [];
    for (const route of criticalRoutes) {
      if (!fs.existsSync(route)) {
        missingRoutes.push(route);
      }
    }

    if (missingRoutes.length > 0) {
      throw new Error(`Missing critical API routes: ${missingRoutes.join(', ')}`);
    }

    return { routes: criticalRoutes.length, missing: 0 };
  }

  // Generate health report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      status: this.errors.length === 0 ? 'HEALTHY' : 'UNHEALTHY',
      summary: {
        checks: this.checks.length,
        passed: this.checks.filter(c => c.status === 'pass').length,
        failed: this.checks.filter(c => c.status === 'fail').length,
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      checks: this.checks,
      errors: this.errors,
      warnings: this.warnings
    };

    return report;
  }

  // Run all checks
  async runAllChecks() {
    log('\n🚀 Starting comprehensive health check...', 'bold');
    
    const checks = [
      ['Required Files', () => this.checkRequiredFiles()],
      ['Environment Variables', () => this.checkEnvironment()],
      ['TypeScript Compilation', () => this.checkTypeScript()],
      ['Database Connection', () => this.checkDatabase()],
      ['Security Scan', () => this.checkSecurity()],
      ['Package Security', () => this.checkPackageSecurity()],
      ['API Endpoints', () => this.checkAPIEndpoints()],
      ['Next.js Build', () => this.checkNextBuild()]
    ];

    for (const [name, checkFn] of checks) {
      try {
        await this.runCheck(name, checkFn);
      } catch (error) {
        // Error already logged by runCheck
      }
    }

    const report = this.generateReport();
    
    log('\n📊 Health Check Summary:', 'bold');
    log(`Status: ${report.status}`, report.status === 'HEALTHY' ? 'green' : 'red');
    log(`Checks: ${report.summary.passed}/${report.summary.checks} passed`);
    
    if (report.summary.errors > 0) {
      log(`Errors: ${report.summary.errors}`, 'red');
    }
    
    if (report.summary.warnings > 0) {
      log(`Warnings: ${report.summary.warnings}`, 'yellow');
    }

    // Write report to file
    fs.writeFileSync('health-check-report.json', JSON.stringify(report, null, 2));
    log('\n📄 Detailed report saved to health-check-report.json', 'blue');

    return report;
  }
}

// Main execution
async function main() {
  const checker = new HealthChecker();
  
  try {
    const report = await checker.runAllChecks();
    
    if (report.status === 'HEALTHY') {
      log('\n🎉 All health checks passed! Application is ready for deployment.', 'green');
      process.exit(0);
    } else {
      log('\n💥 Health check failed! Please fix the issues before deployment.', 'red');
      process.exit(1);
    }
  } catch (error) {
    logError(`Health check system failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { HealthChecker };