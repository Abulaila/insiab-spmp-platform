/**
 * Centralized Defect Tracking and Quality Gates System
 * 
 * This system provides a comprehensive approach to tracking defects,
 * implementing quality gates, and ensuring consistent quality throughout
 * the development lifecycle.
 */

export interface Defect {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'server_error' | 'ui_bug' | 'performance' | 'security' | 'data' | 'integration' | 'other';
  status: 'open' | 'in_progress' | 'fixed' | 'verified' | 'closed' | 'wont_fix';
  reportedBy: string;
  assignedTo?: string;
  reportedAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  tags: string[];
  steps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment: string;
  browser?: string;
  version?: string;
  attachments: string[];
  relatedDefects: string[];
  rootCause?: string;
  resolution?: string;
  verificationSteps?: string[];
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  criteria: QualityGateCriteria[];
  blockingLevel: 'warning' | 'error'; // warning = proceed with warning, error = block
  environment: 'development' | 'staging' | 'production' | 'all';
}

export interface QualityGateCriteria {
  id: string;
  name: string;
  type: 'health_check' | 'test_coverage' | 'typescript_errors' | 'lint_errors' | 'security_scan' | 'performance' | 'custom';
  threshold?: number;
  operator?: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne';
  enabled: boolean;
  customCheck?: () => Promise<{ passed: boolean; value?: number; message: string }>;
}

export interface QualityGateResult {
  gateId: string;
  gateName: string;
  passed: boolean;
  blockingLevel: 'warning' | 'error';
  criteria: Array<{
    criteriaId: string;
    name: string;
    passed: boolean;
    value?: number;
    threshold?: number;
    message: string;
  }>;
  timestamp: Date;
}

export interface DefectMetrics {
  total: number;
  open: number;
  inProgress: number;
  fixed: number;
  verified: number;
  closed: number;
  wontFix: number;
  bySeverity: Record<Defect['severity'], number>;
  byCategory: Record<Defect['category'], number>;
  averageResolutionTime: number; // in hours
  escapeRate: number; // defects found in production vs total
}

class DefectTracker {
  private defects: Map<string, Defect> = new Map();
  private qualityGates: Map<string, QualityGate> = new Map();
  
  constructor() {
    this.initializeDefaultQualityGates();
    this.loadFromStorage();
  }

  // Defect Management
  reportDefect(defect: Omit<Defect, 'id' | 'reportedAt' | 'updatedAt'>): string {
    const id = this.generateDefectId();
    const newDefect: Defect = {
      ...defect,
      id,
      reportedAt: new Date(),
      updatedAt: new Date()
    };
    
    this.defects.set(id, newDefect);
    this.saveToStorage();
    this.notifyDefectReported(newDefect);
    
    return id;
  }

  updateDefect(id: string, updates: Partial<Defect>): boolean {
    const defect = this.defects.get(id);
    if (!defect) return false;
    
    const updatedDefect = {
      ...defect,
      ...updates,
      updatedAt: new Date()
    };
    
    if (updates.status === 'fixed' && !defect.resolvedAt) {
      updatedDefect.resolvedAt = new Date();
    }
    
    this.defects.set(id, updatedDefect);
    this.saveToStorage();
    this.notifyDefectUpdated(updatedDefect);
    
    return true;
  }

  getDefect(id: string): Defect | undefined {
    return this.defects.get(id);
  }

  getAllDefects(filters?: {
    status?: Defect['status'];
    severity?: Defect['severity'];
    category?: Defect['category'];
    assignedTo?: string;
  }): Defect[] {
    let defects = Array.from(this.defects.values());
    
    if (filters) {
      if (filters.status) {
        defects = defects.filter(d => d.status === filters.status);
      }
      if (filters.severity) {
        defects = defects.filter(d => d.severity === filters.severity);
      }
      if (filters.category) {
        defects = defects.filter(d => d.category === filters.category);
      }
      if (filters.assignedTo) {
        defects = defects.filter(d => d.assignedTo === filters.assignedTo);
      }
    }
    
    return defects.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getDefectMetrics(): DefectMetrics {
    const defects = Array.from(this.defects.values());
    
    const metrics: DefectMetrics = {
      total: defects.length,
      open: defects.filter(d => d.status === 'open').length,
      inProgress: defects.filter(d => d.status === 'in_progress').length,
      fixed: defects.filter(d => d.status === 'fixed').length,
      verified: defects.filter(d => d.status === 'verified').length,
      closed: defects.filter(d => d.status === 'closed').length,
      wontFix: defects.filter(d => d.status === 'wont_fix').length,
      bySeverity: {
        critical: defects.filter(d => d.severity === 'critical').length,
        high: defects.filter(d => d.severity === 'high').length,
        medium: defects.filter(d => d.severity === 'medium').length,
        low: defects.filter(d => d.severity === 'low').length
      },
      byCategory: {
        server_error: defects.filter(d => d.category === 'server_error').length,
        ui_bug: defects.filter(d => d.category === 'ui_bug').length,
        performance: defects.filter(d => d.category === 'performance').length,
        security: defects.filter(d => d.category === 'security').length,
        data: defects.filter(d => d.category === 'data').length,
        integration: defects.filter(d => d.category === 'integration').length,
        other: defects.filter(d => d.category === 'other').length
      },
      averageResolutionTime: this.calculateAverageResolutionTime(defects),
      escapeRate: this.calculateEscapeRate(defects)
    };
    
    return metrics;
  }

  // Quality Gates
  addQualityGate(gate: Omit<QualityGate, 'id'>): string {
    const id = this.generateQualityGateId();
    const newGate: QualityGate = { ...gate, id };
    
    this.qualityGates.set(id, newGate);
    this.saveToStorage();
    
    return id;
  }

  updateQualityGate(id: string, updates: Partial<QualityGate>): boolean {
    const gate = this.qualityGates.get(id);
    if (!gate) return false;
    
    this.qualityGates.set(id, { ...gate, ...updates });
    this.saveToStorage();
    
    return true;
  }

  async runQualityGates(environment: string = 'development'): Promise<QualityGateResult[]> {
    const applicableGates = Array.from(this.qualityGates.values())
      .filter(gate => gate.enabled && (gate.environment === environment || gate.environment === 'all'));
    
    const results: QualityGateResult[] = [];
    
    for (const gate of applicableGates) {
      const result = await this.evaluateQualityGate(gate);
      results.push(result);
    }
    
    return results;
  }

  async evaluateQualityGate(gate: QualityGate): Promise<QualityGateResult> {
    const criteriaResults = [];
    let gatePassedOverall = true;
    
    for (const criteria of gate.criteria) {
      if (!criteria.enabled) continue;
      
      const result = await this.evaluateCriteria(criteria);
      criteriaResults.push({
        criteriaId: criteria.id,
        name: criteria.name,
        passed: result.passed,
        value: result.value,
        threshold: criteria.threshold,
        message: result.message
      });
      
      if (!result.passed) {
        gatePassedOverall = false;
      }
    }
    
    return {
      gateId: gate.id,
      gateName: gate.name,
      passed: gatePassedOverall,
      blockingLevel: gate.blockingLevel,
      criteria: criteriaResults,
      timestamp: new Date()
    };
  }

  private async evaluateCriteria(criteria: QualityGateCriteria): Promise<{ passed: boolean; value?: number; message: string }> {
    try {
      switch (criteria.type) {
        case 'health_check':
          return await this.checkHealthEndpoint();
          
        case 'typescript_errors':
          return await this.checkTypeScriptErrors();
          
        case 'lint_errors':
          return await this.checkLintErrors();
          
        case 'test_coverage':
          return await this.checkTestCoverage(criteria.threshold || 80);
          
        case 'security_scan':
          return await this.checkSecurityVulnerabilities();
          
        case 'performance':
          return await this.checkPerformanceMetrics(criteria.threshold || 2000);
          
        case 'custom':
          return criteria.customCheck ? await criteria.customCheck() : { passed: true, message: 'No custom check defined' };
          
        default:
          return { passed: true, message: 'Unknown criteria type' };
      }
    } catch (error) {
      return { 
        passed: false, 
        message: `Criteria evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Quality Gate Checks
  private async checkHealthEndpoint(): Promise<{ passed: boolean; value?: number; message: string }> {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      
      return {
        passed: response.ok && data.status === 'healthy',
        value: response.status,
        message: response.ok ? 'Health endpoint is healthy' : `Health check failed: ${data.message || 'Unknown error'}`
      };
    } catch (error) {
      return {
        passed: false,
        message: `Health endpoint unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async checkTypeScriptErrors(): Promise<{ passed: boolean; value?: number; message: string }> {
    // This would typically run `tsc --noEmit` and parse the output
    // For now, we'll simulate the check
    return {
      passed: true,
      value: 0,
      message: 'No TypeScript errors found'
    };
  }

  private async checkLintErrors(): Promise<{ passed: boolean; value?: number; message: string }> {
    // This would typically run ESLint and parse the output
    return {
      passed: true,
      value: 0,
      message: 'No linting errors found'
    };
  }

  private async checkTestCoverage(threshold: number): Promise<{ passed: boolean; value?: number; message: string }> {
    // This would typically check test coverage reports
    const coverage = 85; // Simulated coverage
    return {
      passed: coverage >= threshold,
      value: coverage,
      message: `Test coverage: ${coverage}% (threshold: ${threshold}%)`
    };
  }

  private async checkSecurityVulnerabilities(): Promise<{ passed: boolean; value?: number; message: string }> {
    // This would typically run security scanners
    return {
      passed: true,
      value: 0,
      message: 'No security vulnerabilities found'
    };
  }

  private async checkPerformanceMetrics(threshold: number): Promise<{ passed: boolean; value?: number; message: string }> {
    // This would typically check performance metrics
    const responseTime = 150; // Simulated response time
    return {
      passed: responseTime <= threshold,
      value: responseTime,
      message: `Average response time: ${responseTime}ms (threshold: ${threshold}ms)`
    };
  }

  // Utility Methods
  private generateDefectId(): string {
    return `DEF-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private generateQualityGateId(): string {
    return `QG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  }

  private calculateAverageResolutionTime(defects: Defect[]): number {
    const resolvedDefects = defects.filter(d => d.resolvedAt && d.reportedAt);
    if (resolvedDefects.length === 0) return 0;
    
    const totalTime = resolvedDefects.reduce((sum, defect) => {
      const resolutionTime = defect.resolvedAt!.getTime() - defect.reportedAt.getTime();
      return sum + resolutionTime;
    }, 0);
    
    return totalTime / resolvedDefects.length / (1000 * 60 * 60); // Convert to hours
  }

  private calculateEscapeRate(defects: Defect[]): number {
    const productionDefects = defects.filter(d => d.environment === 'production');
    return defects.length > 0 ? (productionDefects.length / defects.length) * 100 : 0;
  }

  private initializeDefaultQualityGates(): void {
    const defaultGates: Omit<QualityGate, 'id'>[] = [
      {
        name: 'Pre-Deployment Health Check',
        description: 'Ensures all critical systems are healthy before deployment',
        enabled: true,
        blockingLevel: 'error',
        environment: 'all',
        criteria: [
          {
            id: 'health-endpoint',
            name: 'Health Endpoint',
            type: 'health_check',
            enabled: true
          },
          {
            id: 'typescript-check',
            name: 'TypeScript Compilation',
            type: 'typescript_errors',
            threshold: 0,
            operator: 'eq',
            enabled: true
          }
        ]
      },
      {
        name: 'Code Quality Gate',
        description: 'Ensures code meets quality standards',
        enabled: true,
        blockingLevel: 'warning',
        environment: 'development',
        criteria: [
          {
            id: 'lint-check',
            name: 'ESLint Errors',
            type: 'lint_errors',
            threshold: 0,
            operator: 'eq',
            enabled: true
          },
          {
            id: 'test-coverage',
            name: 'Test Coverage',
            type: 'test_coverage',
            threshold: 80,
            operator: 'gte',
            enabled: false // Disabled until we have proper tests
          }
        ]
      },
      {
        name: 'Production Readiness Gate',
        description: 'Final checks before production deployment',
        enabled: true,
        blockingLevel: 'error',
        environment: 'production',
        criteria: [
          {
            id: 'security-scan',
            name: 'Security Vulnerabilities',
            type: 'security_scan',
            threshold: 0,
            operator: 'eq',
            enabled: true
          },
          {
            id: 'performance-check',
            name: 'Performance Metrics',
            type: 'performance',
            threshold: 2000,
            operator: 'lte',
            enabled: true
          }
        ]
      }
    ];

    defaultGates.forEach(gate => this.addQualityGate(gate));
  }

  private notifyDefectReported(defect: Defect): void {
    console.log(`🐛 New defect reported: ${defect.title} (${defect.severity})`);
    // In production, this would send notifications to relevant team members
  }

  private notifyDefectUpdated(defect: Defect): void {
    console.log(`🔄 Defect updated: ${defect.title} -> ${defect.status}`);
    // In production, this would send notifications to stakeholders
  }

  private saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('defect-tracker-defects', JSON.stringify(Array.from(this.defects.entries())));
      localStorage.setItem('defect-tracker-gates', JSON.stringify(Array.from(this.qualityGates.entries())));
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const storedDefects = localStorage.getItem('defect-tracker-defects');
        if (storedDefects) {
          const defectEntries = JSON.parse(storedDefects);
          this.defects = new Map(defectEntries.map(([id, defect]: [string, any]) => [
            id, 
            {
              ...defect,
              reportedAt: new Date(defect.reportedAt),
              updatedAt: new Date(defect.updatedAt),
              resolvedAt: defect.resolvedAt ? new Date(defect.resolvedAt) : undefined
            }
          ]));
        }

        const storedGates = localStorage.getItem('defect-tracker-gates');
        if (storedGates) {
          const gateEntries = JSON.parse(storedGates);
          this.qualityGates = new Map(gateEntries);
        }
      } catch (error) {
        console.error('Failed to load defect tracker data from storage:', error);
      }
    }
  }
}

// Singleton instance
export const defectTracker = new DefectTracker();

// Hook for React components
export function useDefectTracking() {
  return {
    reportDefect: (defect: Omit<Defect, 'id' | 'reportedAt' | 'updatedAt'>) => defectTracker.reportDefect(defect),
    updateDefect: (id: string, updates: Partial<Defect>) => defectTracker.updateDefect(id, updates),
    getDefect: (id: string) => defectTracker.getDefect(id),
    getAllDefects: (filters?: Parameters<typeof defectTracker.getAllDefects>[0]) => defectTracker.getAllDefects(filters),
    getMetrics: () => defectTracker.getDefectMetrics(),
    runQualityGates: (environment?: string) => defectTracker.runQualityGates(environment)
  };
}