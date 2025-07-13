'use client';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: RiskCategory;
  type: RiskType;
  source: RiskSource;
  probability: number; // 0-100
  impact: RiskImpact;
  severity: RiskSeverity;
  status: RiskStatus;
  owner: string;
  reporter: string;
  reportedDate: string;
  lastUpdated: string;
  dueDate?: string;
  mitigationStrategy?: MitigationStrategy;
  contingencyPlan?: ContingencyPlan;
  triggers: RiskTrigger[];
  dependencies: string[];
  relatedRisks: string[];
  evidence: Evidence[];
  assessments: RiskAssessment[];
  history: RiskHistory[];
  metadata: RiskMetadata;
}

export interface RiskImpact {
  overall: number; // 1-10 scale
  schedule: number;
  budget: number;
  quality: number;
  scope: number;
  resources: number;
  reputation: number;
  strategic: number;
  operational: number;
  financial: number;
  compliance: number;
}

export type RiskCategory = 
  | 'technical' | 'operational' | 'financial' | 'strategic' 
  | 'external' | 'resource' | 'compliance' | 'security' 
  | 'quality' | 'schedule' | 'scope' | 'stakeholder';

export type RiskType = 
  | 'threat' | 'opportunity' | 'assumption' | 'issue' 
  | 'constraint' | 'dependency' | 'unknown';

export type RiskSource = 
  | 'project_team' | 'stakeholder' | 'vendor' | 'market' 
  | 'technology' | 'regulation' | 'environment' | 'organization' 
  | 'ai_prediction' | 'historical_data' | 'expert_judgment';

export type RiskStatus = 
  | 'identified' | 'assessed' | 'planned' | 'monitored' 
  | 'mitigated' | 'closed' | 'escalated' | 'transferred';

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface MitigationStrategy {
  id: string;
  approach: MitigationApproach;
  actions: MitigationAction[];
  timeline: string;
  budget: number;
  owner: string;
  effectiveness: number; // Expected reduction in risk score
  cost: number;
  effort: number;
  feasibility: number;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  successCriteria: string[];
  kpis: MitigationKPI[];
}

export type MitigationApproach = 
  | 'avoid' | 'mitigate' | 'transfer' | 'accept' 
  | 'exploit' | 'enhance' | 'share' | 'ignore';

export interface MitigationAction {
  id: string;
  description: string;
  type: ActionType;
  owner: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  effort: number;
  cost: number;
  dependencies: string[];
  deliverables: string[];
  successMetrics: string[];
}

export type ActionType = 
  | 'preventive' | 'corrective' | 'detective' | 'compensating' 
  | 'process_change' | 'training' | 'technology' | 'documentation';

export interface ContingencyPlan {
  id: string;
  triggerConditions: string[];
  activationCriteria: string;
  response: ContingencyResponse;
  resources: ContingencyResource[];
  timeline: string;
  escalationPath: string[];
  successCriteria: string[];
  rollbackPlan?: string;
}

export interface ContingencyResponse {
  immediateActions: string[];
  shortTermActions: string[];
  longTermActions: string[];
  communicationPlan: CommunicationPlan;
  resourceAllocation: ResourceAllocation[];
}

export interface CommunicationPlan {
  stakeholders: CommunicationStakeholder[];
  channels: string[];
  frequency: string;
  escalationMatrix: EscalationLevel[];
}

export interface CommunicationStakeholder {
  role: string;
  contact: string;
  notificationMethod: string[];
  urgency: 'immediate' | 'urgent' | 'normal' | 'low';
}

export interface EscalationLevel {
  level: number;
  timeframe: string;
  authority: string[];
  triggers: string[];
}

export interface ResourceAllocation {
  type: 'human' | 'financial' | 'technical' | 'infrastructure';
  description: string;
  quantity: number;
  availability: string;
  alternatives: string[];
}

export interface ContingencyResource {
  id: string;
  type: string;
  description: string;
  availability: string;
  cost: number;
  lead_time: number;
  alternatives: string[];
}

export interface RiskTrigger {
  id: string;
  condition: string;
  type: 'leading' | 'lagging' | 'concurrent';
  threshold: TriggerThreshold;
  monitoring: MonitoringConfig;
  automated: boolean;
  actions: string[];
}

export interface TriggerThreshold {
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'contains';
  value: any;
  timeframe?: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

export interface MonitoringConfig {
  frequency: string;
  dataSource: string;
  automation: boolean;
  alerting: AlertConfig;
}

export interface AlertConfig {
  channels: string[];
  recipients: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  template: string;
}

export interface Evidence {
  id: string;
  type: 'document' | 'data' | 'observation' | 'expert_opinion' | 'historical';
  source: string;
  description: string;
  reliability: number; // 1-10 scale
  timestamp: string;
  url?: string;
  attachment?: string;
}

export interface RiskAssessment {
  id: string;
  assessor: string;
  method: AssessmentMethod;
  date: string;
  probability: number;
  impact: RiskImpact;
  score: number;
  confidence: number;
  assumptions: string[];
  limitations: string[];
  recommendations: string[];
  nextReview: string;
}

export type AssessmentMethod = 
  | 'qualitative' | 'quantitative' | 'semi_quantitative' 
  | 'monte_carlo' | 'decision_tree' | 'expert_judgment' 
  | 'historical_analysis' | 'scenario_analysis';

export interface RiskHistory {
  id: string;
  timestamp: string;
  action: HistoryAction;
  actor: string;
  changes: { [field: string]: { from: any; to: any } };
  notes?: string;
}

export type HistoryAction = 
  | 'created' | 'updated' | 'assessed' | 'assigned' 
  | 'escalated' | 'mitigated' | 'closed' | 'reopened';

export interface RiskMetadata {
  tags: string[];
  customFields: { [key: string]: any };
  confidence: number;
  dataQuality: DataQuality;
  lastReviewed: string;
  reviewCycle: string;
  approvals: Approval[];
}

export interface DataQuality {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  validity: number;
}

export interface Approval {
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comments?: string;
}

export interface MitigationKPI {
  name: string;
  target: number;
  current: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
}

export interface RiskRegister {
  projectId: string;
  risks: Risk[];
  metadata: RegisterMetadata;
  configuration: RiskConfiguration;
  analytics: RiskAnalytics;
}

export interface RegisterMetadata {
  created: string;
  lastUpdated: string;
  version: string;
  owner: string;
  approvals: Approval[];
  reviewSchedule: string;
}

export interface RiskConfiguration {
  categories: CategoryConfig[];
  impactScales: ImpactScale[];
  probabilityScale: ProbabilityScale;
  matrixConfiguration: RiskMatrix;
  workflows: RiskWorkflow[];
  notifications: NotificationConfig[];
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  defaultOwner?: string;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  timeframe: string;
  escalateTo: string;
  actions: string[];
}

export interface ImpactScale {
  dimension: string;
  levels: ScaleLevel[];
  unit: string;
  calculation?: string;
}

export interface ScaleLevel {
  value: number;
  label: string;
  description: string;
  threshold?: number;
  color: string;
}

export interface ProbabilityScale {
  type: 'percentage' | 'qualitative' | 'frequency';
  levels: ScaleLevel[];
  timeframe: string;
}

export interface RiskMatrix {
  dimensions: ['probability', 'impact'];
  thresholds: MatrixThreshold[];
  colors: { [severity: string]: string };
  actions: { [severity: string]: string[] };
}

export interface MatrixThreshold {
  probability: { min: number; max: number };
  impact: { min: number; max: number };
  severity: RiskSeverity;
  requiredActions: string[];
}

export interface RiskWorkflow {
  id: string;
  name: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  approvals: WorkflowApproval[];
  notifications: WorkflowNotification[];
}

export interface WorkflowTrigger {
  event: string;
  condition?: string;
  automated: boolean;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'approval' | 'notification' | 'automation';
  assignee: string;
  duration: string;
  requirements: string[];
  outcomes: string[];
}

export interface WorkflowApproval {
  level: number;
  approvers: string[];
  criteria: string;
  timeout: string;
  escalation: string;
}

export interface WorkflowNotification {
  trigger: string;
  recipients: string[];
  template: string;
  channel: string[];
}

export interface NotificationConfig {
  event: string;
  recipients: RecipientConfig[];
  template: string;
  channels: string[];
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

export interface RecipientConfig {
  type: 'role' | 'user' | 'group' | 'external';
  identifier: string;
  conditions?: string[];
}

export interface RiskAnalytics {
  summary: RiskSummary;
  trends: RiskTrend[];
  heatmap: RiskHeatmap;
  predictions: RiskPrediction[];
  benchmarks: RiskBenchmark[];
  insights: RiskInsight[];
}

export interface RiskSummary {
  totalRisks: number;
  risksByStatus: { [status: string]: number };
  risksByCategory: { [category: string]: number };
  risksBySeverity: { [severity: string]: number };
  exposureScore: number;
  mitigationEffectiveness: number;
  trendDirection: 'improving' | 'stable' | 'deteriorating';
}

export interface RiskTrend {
  metric: string;
  period: string;
  data: TrendDataPoint[];
  forecast: ForecastPoint[];
  analysis: TrendAnalysis;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  context?: string;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  confidence: number;
  range: { min: number; max: number };
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  significance: number;
  factors: string[];
  recommendations: string[];
}

export interface RiskHeatmap {
  matrix: HeatmapCell[][];
  metadata: HeatmapMetadata;
}

export interface HeatmapCell {
  probability: number;
  impact: number;
  count: number;
  risks: string[];
  severity: RiskSeverity;
}

export interface HeatmapMetadata {
  dimensions: string[];
  scales: { [dimension: string]: any };
  lastUpdated: string;
}

export interface RiskPrediction {
  type: 'emergence' | 'escalation' | 'mitigation_success' | 'impact_realization';
  confidence: number;
  timeframe: string;
  description: string;
  factors: PredictionFactor[];
  recommendations: string[];
  monitoring: string[];
}

export interface PredictionFactor {
  name: string;
  weight: number;
  value: number;
  trend: string;
  confidence: number;
}

export interface RiskBenchmark {
  metric: string;
  industry: string;
  projectType: string;
  value: number;
  percentile: number;
  source: string;
  comparison: 'better' | 'similar' | 'worse';
}

export interface RiskInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'correlation' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  evidence: string[];
  actions: string[];
  priority: number;
}

export class RiskEngine {
  private registers: Map<string, RiskRegister> = new Map();
  private globalConfig: RiskConfiguration;

  constructor() {
    this.globalConfig = this.initializeDefaultConfiguration();
  }

  private initializeDefaultConfiguration(): RiskConfiguration {
    return {
      categories: [
        {
          id: 'technical',
          name: 'Technical',
          description: 'Technology, architecture, and development risks',
          color: '#3B82F6',
          icon: '⚙️',
          escalationRules: []
        },
        {
          id: 'operational',
          name: 'Operational',
          description: 'Process, resource, and execution risks',
          color: '#10B981',
          icon: '🔄',
          escalationRules: []
        },
        {
          id: 'financial',
          name: 'Financial',
          description: 'Budget, cost, and funding risks',
          color: '#F59E0B',
          icon: '💰',
          escalationRules: []
        },
        {
          id: 'strategic',
          name: 'Strategic',
          description: 'Business alignment and strategic risks',
          color: '#8B5CF6',
          icon: '🎯',
          escalationRules: []
        },
        {
          id: 'external',
          name: 'External',
          description: 'Market, regulatory, and environmental risks',
          color: '#EF4444',
          icon: '🌍',
          escalationRules: []
        }
      ],
      impactScales: [
        {
          dimension: 'schedule',
          unit: 'days',
          levels: [
            { value: 1, label: 'Minimal', description: '< 1 day delay', color: '#10B981' },
            { value: 3, label: 'Minor', description: '1-5 days delay', color: '#F59E0B' },
            { value: 5, label: 'Moderate', description: '1-2 weeks delay', color: '#EF4444' },
            { value: 8, label: 'Major', description: '2-4 weeks delay', color: '#DC2626' },
            { value: 10, label: 'Severe', description: '> 1 month delay', color: '#991B1B' }
          ]
        },
        {
          dimension: 'budget',
          unit: 'percentage',
          levels: [
            { value: 1, label: 'Minimal', description: '< 2% budget impact', color: '#10B981' },
            { value: 3, label: 'Minor', description: '2-5% budget impact', color: '#F59E0B' },
            { value: 5, label: 'Moderate', description: '5-10% budget impact', color: '#EF4444' },
            { value: 8, label: 'Major', description: '10-20% budget impact', color: '#DC2626' },
            { value: 10, label: 'Severe', description: '> 20% budget impact', color: '#991B1B' }
          ]
        }
      ],
      probabilityScale: {
        type: 'percentage',
        timeframe: 'project duration',
        levels: [
          { value: 5, label: 'Very Low', description: '0-10% chance', color: '#10B981' },
          { value: 20, label: 'Low', description: '11-30% chance', color: '#84CC16' },
          { value: 50, label: 'Medium', description: '31-60% chance', color: '#F59E0B' },
          { value: 80, label: 'High', description: '61-85% chance', color: '#EF4444' },
          { value: 95, label: 'Very High', description: '86-100% chance', color: '#DC2626' }
        ]
      },
      matrixConfiguration: {
        dimensions: ['probability', 'impact'],
        thresholds: [
          {
            probability: { min: 0, max: 30 },
            impact: { min: 0, max: 3 },
            severity: 'low',
            requiredActions: ['Monitor', 'Document']
          },
          {
            probability: { min: 31, max: 60 },
            impact: { min: 4, max: 6 },
            severity: 'medium',
            requiredActions: ['Plan Mitigation', 'Assign Owner', 'Regular Review']
          },
          {
            probability: { min: 61, max: 85 },
            impact: { min: 7, max: 8 },
            severity: 'high',
            requiredActions: ['Immediate Mitigation', 'Escalate', 'Contingency Plan']
          },
          {
            probability: { min: 86, max: 100 },
            impact: { min: 9, max: 10 },
            severity: 'critical',
            requiredActions: ['Emergency Response', 'Executive Escalation', 'Crisis Management']
          }
        ],
        colors: {
          low: '#10B981',
          medium: '#F59E0B',
          high: '#EF4444',
          critical: '#DC2626'
        },
        actions: {
          low: ['Monitor regularly', 'Document lessons learned'],
          medium: ['Develop mitigation plan', 'Assign risk owner', 'Monthly review'],
          high: ['Implement immediate mitigation', 'Weekly monitoring', 'Escalate to management'],
          critical: ['Activate emergency response', 'Daily monitoring', 'Executive involvement']
        }
      },
      workflows: [],
      notifications: []
    };
  }

  // Risk Register Management
  createRiskRegister(projectId: string): RiskRegister {
    const register: RiskRegister = {
      projectId,
      risks: [],
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        version: '1.0',
        owner: 'project-manager',
        approvals: [],
        reviewSchedule: 'weekly'
      },
      configuration: { ...this.globalConfig },
      analytics: this.initializeAnalytics()
    };

    this.registers.set(projectId, register);
    return register;
  }

  private initializeAnalytics(): RiskAnalytics {
    return {
      summary: {
        totalRisks: 0,
        risksByStatus: {},
        risksByCategory: {},
        risksBySeverity: {},
        exposureScore: 0,
        mitigationEffectiveness: 0,
        trendDirection: 'stable'
      },
      trends: [],
      heatmap: {
        matrix: [],
        metadata: {
          dimensions: ['probability', 'impact'],
          scales: {},
          lastUpdated: new Date().toISOString()
        }
      },
      predictions: [],
      benchmarks: [],
      insights: []
    };
  }

  getRiskRegister(projectId: string): RiskRegister | null {
    return this.registers.get(projectId) || null;
  }

  // Risk Management
  addRisk(projectId: string, riskData: Partial<Risk>): Risk {
    const register = this.getRiskRegister(projectId);
    if (!register) {
      throw new Error(`Risk register not found for project ${projectId}`);
    }

    const risk: Risk = {
      id: this.generateId(),
      title: riskData.title || 'Untitled Risk',
      description: riskData.description || '',
      category: riskData.category || 'operational',
      type: riskData.type || 'threat',
      source: riskData.source || 'project_team',
      probability: riskData.probability || 50,
      impact: riskData.impact || this.getDefaultImpact(),
      severity: 'medium',
      status: 'identified',
      owner: riskData.owner || 'unassigned',
      reporter: riskData.reporter || 'system',
      reportedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      triggers: riskData.triggers || [],
      dependencies: riskData.dependencies || [],
      relatedRisks: riskData.relatedRisks || [],
      evidence: riskData.evidence || [],
      assessments: [],
      history: [{
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        action: 'created',
        actor: riskData.reporter || 'system',
        changes: {}
      }],
      metadata: {
        tags: riskData.metadata?.tags || [],
        customFields: riskData.metadata?.customFields || {},
        confidence: riskData.metadata?.confidence || 50,
        dataQuality: {
          completeness: 60,
          accuracy: 80,
          timeliness: 100,
          consistency: 70,
          validity: 80
        },
        lastReviewed: new Date().toISOString(),
        reviewCycle: 'weekly',
        approvals: []
      }
    };

    // Calculate severity
    risk.severity = this.calculateSeverity(risk.probability, risk.impact.overall);

    register.risks.push(risk);
    register.metadata.lastUpdated = new Date().toISOString();
    
    this.updateAnalytics(projectId);
    return risk;
  }

  private getDefaultImpact(): RiskImpact {
    return {
      overall: 5,
      schedule: 3,
      budget: 3,
      quality: 3,
      scope: 3,
      resources: 3,
      reputation: 3,
      strategic: 3,
      operational: 3,
      financial: 3,
      compliance: 3
    };
  }

  updateRisk(projectId: string, riskId: string, updates: Partial<Risk>): Risk {
    const register = this.getRiskRegister(projectId);
    if (!register) {
      throw new Error(`Risk register not found for project ${projectId}`);
    }

    const riskIndex = register.risks.findIndex(r => r.id === riskId);
    if (riskIndex === -1) {
      throw new Error(`Risk ${riskId} not found`);
    }

    const risk = register.risks[riskIndex];
    const changes: { [field: string]: { from: any; to: any } } = {};

    // Track changes
    Object.keys(updates).forEach(key => {
      if (key in risk && (risk as any)[key] !== (updates as any)[key]) {
        changes[key] = { from: (risk as any)[key], to: (updates as any)[key] };
      }
    });

    // Apply updates
    Object.assign(risk, updates);
    risk.lastUpdated = new Date().toISOString();

    // Recalculate severity if probability or impact changed
    if (updates.probability !== undefined || updates.impact !== undefined) {
      risk.severity = this.calculateSeverity(risk.probability, risk.impact.overall);
    }

    // Add history entry
    risk.history.push({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: 'updated',
      actor: 'user', // Should be passed from context
      changes,
      notes: updates.metadata?.customFields?.updateNotes
    });

    register.metadata.lastUpdated = new Date().toISOString();
    this.updateAnalytics(projectId);
    
    return risk;
  }

  assessRisk(projectId: string, riskId: string, assessment: Omit<RiskAssessment, 'id' | 'date' | 'score'>): RiskAssessment {
    const register = this.getRiskRegister(projectId);
    if (!register) {
      throw new Error(`Risk register not found for project ${projectId}`);
    }

    const risk = register.risks.find(r => r.id === riskId);
    if (!risk) {
      throw new Error(`Risk ${riskId} not found`);
    }

    const fullAssessment: RiskAssessment = {
      ...assessment,
      id: this.generateId(),
      date: new Date().toISOString(),
      score: this.calculateRiskScore(assessment.probability, assessment.impact)
    };

    risk.assessments.push(fullAssessment);
    
    // Update risk with latest assessment
    risk.probability = assessment.probability;
    risk.impact = assessment.impact;
    risk.severity = this.calculateSeverity(assessment.probability, assessment.impact.overall);
    risk.status = 'assessed';
    
    this.updateAnalytics(projectId);
    return fullAssessment;
  }

  private calculateSeverity(probability: number, impact: number): RiskSeverity {
    const score = (probability / 100) * impact;
    
    if (score >= 8) return 'critical';
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }

  private calculateRiskScore(probability: number, impact: RiskImpact): number {
    return (probability / 100) * impact.overall;
  }

  // Mitigation Management
  createMitigationStrategy(projectId: string, riskId: string, strategy: Omit<MitigationStrategy, 'id'>): MitigationStrategy {
    const register = this.getRiskRegister(projectId);
    if (!register) {
      throw new Error(`Risk register not found for project ${projectId}`);
    }

    const risk = register.risks.find(r => r.id === riskId);
    if (!risk) {
      throw new Error(`Risk ${riskId} not found`);
    }

    const mitigationStrategy: MitigationStrategy = {
      ...strategy,
      id: this.generateId()
    };

    risk.mitigationStrategy = mitigationStrategy;
    risk.status = 'planned';
    
    // Add history entry
    risk.history.push({
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      action: 'updated',
      actor: strategy.owner,
      changes: { mitigationStrategy: { from: null, to: mitigationStrategy.id } },
      notes: 'Mitigation strategy created'
    });

    this.updateAnalytics(projectId);
    return mitigationStrategy;
  }

  // Analytics and Insights
  private updateAnalytics(projectId: string): void {
    const register = this.getRiskRegister(projectId);
    if (!register) return;

    // Update summary
    register.analytics.summary = this.calculateSummary(register.risks);
    
    // Update trends
    register.analytics.trends = this.calculateTrends(register.risks);
    
    // Update heatmap
    register.analytics.heatmap = this.generateHeatmap(register.risks);
    
    // Generate predictions
    register.analytics.predictions = this.generatePredictions(register.risks);
    
    // Generate insights
    register.analytics.insights = this.generateInsights(register.risks);
  }

  private calculateSummary(risks: Risk[]): RiskSummary {
    const summary: RiskSummary = {
      totalRisks: risks.length,
      risksByStatus: {},
      risksByCategory: {},
      risksBySeverity: {},
      exposureScore: 0,
      mitigationEffectiveness: 0,
      trendDirection: 'stable'
    };

    // Calculate distributions
    risks.forEach(risk => {
      summary.risksByStatus[risk.status] = (summary.risksByStatus[risk.status] || 0) + 1;
      summary.risksByCategory[risk.category] = (summary.risksByCategory[risk.category] || 0) + 1;
      summary.risksBySeverity[risk.severity] = (summary.risksBySeverity[risk.severity] || 0) + 1;
    });

    // Calculate exposure score
    summary.exposureScore = risks.reduce((total, risk) => {
      return total + this.calculateRiskScore(risk.probability, risk.impact);
    }, 0);

    // Calculate mitigation effectiveness
    const mitigatedRisks = risks.filter(r => r.mitigationStrategy && r.mitigationStrategy.status === 'completed');
    summary.mitigationEffectiveness = mitigatedRisks.length > 0 
      ? mitigatedRisks.reduce((total, risk) => total + (risk.mitigationStrategy?.effectiveness || 0), 0) / mitigatedRisks.length
      : 0;

    return summary;
  }

  private calculateTrends(risks: Risk[]): RiskTrend[] {
    // Mock trend calculation - in real implementation, this would analyze historical data
    return [
      {
        metric: 'risk_count',
        period: '30_days',
        data: [
          { date: '2024-01-01', value: risks.length * 0.8 },
          { date: '2024-01-15', value: risks.length * 0.9 },
          { date: '2024-01-30', value: risks.length }
        ],
        forecast: [
          { date: '2024-02-15', predicted: risks.length * 1.1, confidence: 0.7, range: { min: risks.length * 0.9, max: risks.length * 1.3 } },
          { date: '2024-02-28', predicted: risks.length * 1.2, confidence: 0.6, range: { min: risks.length * 0.8, max: risks.length * 1.5 } }
        ],
        analysis: {
          direction: 'up',
          strength: 'moderate',
          significance: 0.15,
          factors: ['Increased project complexity', 'New regulatory requirements'],
          recommendations: ['Enhance risk identification processes', 'Implement proactive monitoring']
        }
      }
    ];
  }

  private generateHeatmap(risks: Risk[]): RiskHeatmap {
    const matrix: HeatmapCell[][] = [];
    
    // Initialize 5x5 matrix
    for (let i = 0; i < 5; i++) {
      matrix[i] = [];
      for (let j = 0; j < 5; j++) {
        matrix[i][j] = {
          probability: (i + 1) * 20,
          impact: (j + 1) * 2,
          count: 0,
          risks: [],
          severity: 'low'
        };
      }
    }

    // Populate matrix with actual risks
    risks.forEach(risk => {
      const probIndex = Math.min(Math.floor(risk.probability / 20), 4);
      const impactIndex = Math.min(Math.floor(risk.impact.overall / 2), 4);
      
      const cell = matrix[probIndex][impactIndex];
      cell.count++;
      cell.risks.push(risk.id);
      cell.severity = this.calculateSeverity(cell.probability, cell.impact);
    });

    return {
      matrix,
      metadata: {
        dimensions: ['probability', 'impact'],
        scales: {
          probability: this.globalConfig.probabilityScale,
          impact: this.globalConfig.impactScales.find(s => s.dimension === 'overall')
        },
        lastUpdated: new Date().toISOString()
      }
    };
  }

  private generatePredictions(risks: Risk[]): RiskPrediction[] {
    return [
      {
        type: 'emergence',
        confidence: 0.75,
        timeframe: '30_days',
        description: 'High likelihood of new technical risks emerging due to system complexity',
        factors: [
          { name: 'System Complexity', weight: 0.4, value: 8, trend: 'increasing', confidence: 0.8 },
          { name: 'Team Experience', weight: 0.3, value: 6, trend: 'stable', confidence: 0.9 },
          { name: 'Technology Maturity', weight: 0.3, value: 4, trend: 'decreasing', confidence: 0.7 }
        ],
        recommendations: [
          'Increase technical risk monitoring frequency',
          'Conduct additional architecture reviews',
          'Enhance team training on new technologies'
        ],
        monitoring: [
          'Daily technical standup reviews',
          'Weekly architecture health checks',
          'Monthly technology trend analysis'
        ]
      }
    ];
  }

  private generateInsights(risks: Risk[]): RiskInsight[] {
    const insights: RiskInsight[] = [];

    // Pattern detection
    const technicalRisks = risks.filter(r => r.category === 'technical');
    if (technicalRisks.length > risks.length * 0.5) {
      insights.push({
        id: this.generateId(),
        type: 'pattern',
        title: 'High Concentration of Technical Risks',
        description: `${Math.round((technicalRisks.length / risks.length) * 100)}% of risks are technical, indicating potential architecture or technology issues`,
        confidence: 0.85,
        impact: 'high',
        evidence: [`${technicalRisks.length} technical risks out of ${risks.length} total`],
        actions: [
          'Conduct technical risk deep-dive session',
          'Review architecture decisions',
          'Enhance technical governance'
        ],
        priority: 1
      });
    }

    // High-impact risk clusters
    const highImpactRisks = risks.filter(r => r.impact.overall >= 7);
    if (highImpactRisks.length >= 3) {
      insights.push({
        id: this.generateId(),
        type: 'anomaly',
        title: 'Multiple High-Impact Risks Identified',
        description: `${highImpactRisks.length} risks with significant potential impact detected`,
        confidence: 0.9,
        impact: 'high',
        evidence: highImpactRisks.map(r => `${r.title}: ${r.impact.overall}/10 impact`),
        actions: [
          'Prioritize mitigation planning for high-impact risks',
          'Consider project scope or timeline adjustments',
          'Establish crisis management protocols'
        ],
        priority: 1
      });
    }

    return insights;
  }

  // AI-Powered Risk Analysis
  analyzeRiskPatterns(projectId: string): any {
    const register = this.getRiskRegister(projectId);
    if (!register) return null;

    const patterns = {
      riskClusters: this.identifyRiskClusters(register.risks),
      correlations: this.findRiskCorrelations(register.risks),
      emergingThemes: this.detectEmergingThemes(register.risks),
      mitigationGaps: this.identifyMitigationGaps(register.risks)
    };

    return patterns;
  }

  private identifyRiskClusters(risks: Risk[]): any[] {
    // Implementation for clustering similar risks
    return [];
  }

  private findRiskCorrelations(risks: Risk[]): any[] {
    // Implementation for finding risk dependencies and correlations
    return [];
  }

  private detectEmergingThemes(risks: Risk[]): any[] {
    // Implementation for detecting emerging risk themes
    return [];
  }

  private identifyMitigationGaps(risks: Risk[]): any[] {
    // Implementation for identifying gaps in mitigation coverage
    return [];
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Public API methods
  getRisk(projectId: string, riskId: string): Risk | null {
    const register = this.getRiskRegister(projectId);
    return register?.risks.find(r => r.id === riskId) || null;
  }

  listRisks(projectId: string, filters?: any): Risk[] {
    const register = this.getRiskRegister(projectId);
    if (!register) return [];

    let risks = register.risks;

    if (filters) {
      if (filters.category) {
        risks = risks.filter(r => r.category === filters.category);
      }
      if (filters.severity) {
        risks = risks.filter(r => r.severity === filters.severity);
      }
      if (filters.status) {
        risks = risks.filter(r => r.status === filters.status);
      }
      if (filters.owner) {
        risks = risks.filter(r => r.owner === filters.owner);
      }
    }

    return risks;
  }

  getAnalytics(projectId: string): RiskAnalytics | null {
    const register = this.getRiskRegister(projectId);
    return register?.analytics || null;
  }

  generateRiskReport(projectId: string): any {
    const register = this.getRiskRegister(projectId);
    if (!register) return null;

    return {
      projectId,
      generatedAt: new Date().toISOString(),
      summary: register.analytics.summary,
      topRisks: register.risks
        .filter(r => r.severity === 'critical' || r.severity === 'high')
        .sort((a, b) => this.calculateRiskScore(b.probability, b.impact) - this.calculateRiskScore(a.probability, a.impact))
        .slice(0, 10),
      mitigationStatus: this.calculateMitigationStatus(register.risks),
      recommendations: this.generateRecommendations(register.risks),
      trends: register.analytics.trends,
      predictions: register.analytics.predictions
    };
  }

  private calculateMitigationStatus(risks: Risk[]): any {
    const mitigatedCount = risks.filter(r => r.mitigationStrategy?.status === 'completed').length;
    const inProgressCount = risks.filter(r => r.mitigationStrategy?.status === 'in_progress').length;
    const plannedCount = risks.filter(r => r.mitigationStrategy?.status === 'planned').length;
    const unmitigatedCount = risks.filter(r => !r.mitigationStrategy).length;

    return {
      mitigated: mitigatedCount,
      inProgress: inProgressCount,
      planned: plannedCount,
      unmitigated: unmitigatedCount,
      coverage: ((mitigatedCount + inProgressCount + plannedCount) / risks.length) * 100
    };
  }

  private generateRecommendations(risks: Risk[]): string[] {
    const recommendations: string[] = [];

    const criticalRisks = risks.filter(r => r.severity === 'critical');
    if (criticalRisks.length > 0) {
      recommendations.push(`Address ${criticalRisks.length} critical risks immediately`);
    }

    const unmitigatedHighRisks = risks.filter(r => r.severity === 'high' && !r.mitigationStrategy);
    if (unmitigatedHighRisks.length > 0) {
      recommendations.push(`Develop mitigation strategies for ${unmitigatedHighRisks.length} high-severity risks`);
    }

    const staleRisks = risks.filter(r => {
      const daysSinceUpdate = (Date.now() - new Date(r.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });
    if (staleRisks.length > 0) {
      recommendations.push(`Review and update ${staleRisks.length} risks that haven't been updated in 30+ days`);
    }

    return recommendations;
  }
}

export const riskEngine = new RiskEngine();