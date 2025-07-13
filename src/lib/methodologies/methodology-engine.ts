'use client';

export interface Methodology {
  id: string;
  name: string;
  description: string;
  category: 'agile' | 'traditional' | 'hybrid' | 'lean' | 'custom';
  version: string;
  principles: string[];
  phases: MethodologyPhase[];
  artifacts: Artifact[];
  roles: MethodologyRole[];
  ceremonies: Ceremony[];
  practices: Practice[];
  metrics: MethodologyMetric[];
  gates: QualityGate[];
  templates: MethodologyTemplate[];
  constraints: Constraint[];
  adaptations: Adaptation[];
}

export interface MethodologyPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  duration: PhaseDuration;
  objectives: string[];
  deliverables: string[];
  entryConditions: string[];
  exitConditions: string[];
  activities: Activity[];
  dependencies: string[];
  optional: boolean;
  iterative: boolean;
}

export interface PhaseDuration {
  type: 'fixed' | 'variable' | 'timeboxed' | 'milestone_driven';
  estimatedDays?: number;
  minDays?: number;
  maxDays?: number;
  timebox?: number;
  milestones?: string[];
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  type: 'planning' | 'execution' | 'monitoring' | 'review' | 'approval';
  effort: number;
  skills: string[];
  roles: string[];
  inputs: string[];
  outputs: string[];
  tools: string[];
  optional: boolean;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'model' | 'code' | 'prototype' | 'report' | 'plan';
  category: 'planning' | 'analysis' | 'design' | 'implementation' | 'testing' | 'deployment';
  template?: string;
  format: string;
  mandatory: boolean;
  phase: string;
  approval: ApprovalConfig;
  versioning: VersioningConfig;
}

export interface ApprovalConfig {
  required: boolean;
  approvers: string[];
  criteria: string[];
  workflow: string;
}

export interface VersioningConfig {
  strategy: 'major_minor' | 'semantic' | 'sequential' | 'timestamp';
  retention: number;
  baseline: boolean;
}

export interface MethodologyRole {
  id: string;
  name: string;
  description: string;
  type: 'primary' | 'secondary' | 'stakeholder' | 'support';
  responsibilities: string[];
  skills: string[];
  authorities: string[];
  accountability: string[];
  reportingStructure: ReportingStructure;
  optional: boolean;
}

export interface ReportingStructure {
  reportsTo?: string;
  manages?: string[];
  collaboratesWith: string[];
}

export interface Ceremony {
  id: string;
  name: string;
  description: string;
  type: 'meeting' | 'review' | 'retrospective' | 'planning' | 'standup' | 'demo';
  frequency: CeremonyFrequency;
  duration: number;
  participants: string[];
  facilitator: string;
  agenda: AgendaItem[];
  outcomes: string[];
  artifacts: string[];
  preparation: string[];
  optional: boolean;
}

export interface CeremonyFrequency {
  type: 'one_time' | 'daily' | 'weekly' | 'bi_weekly' | 'monthly' | 'milestone' | 'phase_end';
  interval?: number;
  dayOfWeek?: string;
  timeOfDay?: string;
  milestones?: string[];
}

export interface AgendaItem {
  id: string;
  title: string;
  duration: number;
  owner: string;
  type: 'presentation' | 'discussion' | 'decision' | 'review' | 'planning';
  materials?: string[];
}

export interface Practice {
  id: string;
  name: string;
  description: string;
  category: 'planning' | 'development' | 'testing' | 'deployment' | 'monitoring' | 'improvement';
  type: 'technique' | 'tool' | 'process' | 'standard';
  implementation: PracticeImplementation;
  benefits: string[];
  challenges: string[];
  prerequisites: string[];
  metrics: string[];
  variations: PracticeVariation[];
}

export interface PracticeImplementation {
  steps: ImplementationStep[];
  tools: string[];
  skills: string[];
  effort: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface ImplementationStep {
  id: string;
  description: string;
  order: number;
  duration: number;
  owner: string;
  inputs: string[];
  outputs: string[];
}

export interface PracticeVariation {
  id: string;
  name: string;
  context: string;
  modifications: string[];
  applicability: string[];
}

export interface MethodologyMetric {
  id: string;
  name: string;
  description: string;
  category: 'velocity' | 'quality' | 'predictability' | 'value' | 'risk' | 'satisfaction';
  type: 'leading' | 'lagging' | 'real_time';
  calculation: MetricCalculation;
  targets: MetricTarget[];
  frequency: 'daily' | 'weekly' | 'sprint' | 'monthly' | 'milestone';
  visualization: VisualizationConfig;
}

export interface MetricCalculation {
  formula: string;
  inputs: string[];
  dataSource: string;
  aggregation: 'sum' | 'average' | 'count' | 'percentage' | 'ratio';
}

export interface MetricTarget {
  type: 'threshold' | 'range' | 'trend' | 'benchmark';
  value?: number;
  min?: number;
  max?: number;
  direction?: 'increase' | 'decrease' | 'stable';
  benchmark?: string;
}

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'gauge' | 'burndown' | 'cumulative' | 'scatter';
  displayFormat: string;
  colors: string[];
  thresholds: VisualizationThreshold[];
}

export interface VisualizationThreshold {
  value: number;
  color: string;
  label: string;
}

export interface QualityGate {
  id: string;
  name: string;
  description: string;
  phase: string;
  criteria: GateCriteria[];
  approvers: string[];
  escalation: EscalationConfig;
  automation: AutomationConfig;
}

export interface GateCriteria {
  id: string;
  name: string;
  type: 'metric' | 'checklist' | 'artifact' | 'approval';
  condition: string;
  weight: number;
  mandatory: boolean;
  evidence: string[];
}

export interface EscalationConfig {
  levels: EscalationLevel[];
  timeouts: number[];
  notifications: string[];
}

export interface EscalationLevel {
  level: number;
  approvers: string[];
  authority: string;
}

export interface AutomationConfig {
  enabled: boolean;
  triggers: string[];
  actions: string[];
  conditions: string[];
}

export interface MethodologyTemplate {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'checklist' | 'form' | 'dashboard';
  category: string;
  content: string;
  variables: TemplateVariable[];
  permissions: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'list';
  defaultValue?: any;
  required: boolean;
  validation?: string;
}

export interface Constraint {
  id: string;
  name: string;
  description: string;
  type: 'resource' | 'time' | 'budget' | 'scope' | 'quality' | 'regulatory';
  condition: string;
  impact: 'blocking' | 'warning' | 'informational';
  mitigation: string[];
}

export interface Adaptation {
  id: string;
  name: string;
  description: string;
  context: AdaptationContext;
  modifications: MethodologyModification[];
  reasoning: string;
  impact: AdaptationImpact;
}

export interface AdaptationContext {
  organizationSize: 'small' | 'medium' | 'large' | 'enterprise';
  projectSize: 'small' | 'medium' | 'large' | 'enterprise';
  complexity: 'low' | 'medium' | 'high' | 'very_high';
  industry: string[];
  regulations: string[];
  culture: string[];
  maturity: 'initial' | 'repeatable' | 'defined' | 'managed' | 'optimizing';
}

export interface MethodologyModification {
  type: 'add' | 'remove' | 'modify' | 'replace';
  target: 'phase' | 'activity' | 'artifact' | 'role' | 'ceremony' | 'practice';
  targetId: string;
  change: any;
  justification: string;
}

export interface AdaptationImpact {
  effort: number;
  risk: 'low' | 'medium' | 'high';
  benefits: string[];
  drawbacks: string[];
  dependencies: string[];
}

export interface ProjectMethodology {
  projectId: string;
  methodologyId: string;
  adaptations: string[];
  customizations: Customization[];
  progress: MethodologyProgress;
  compliance: ComplianceStatus;
}

export interface Customization {
  id: string;
  type: 'configuration' | 'extension' | 'integration';
  target: string;
  configuration: any;
  rationale: string;
}

export interface MethodologyProgress {
  currentPhase: string;
  completedPhases: string[];
  phaseProgress: { [phaseId: string]: PhaseProgress };
  overallProgress: number;
  milestones: MilestoneStatus[];
}

export interface PhaseProgress {
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  progressPercentage: number;
  startDate?: string;
  endDate?: string;
  completedActivities: string[];
  blockers: string[];
  artifacts: ArtifactStatus[];
}

export interface ArtifactStatus {
  artifactId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'approved' | 'rejected';
  version: string;
  lastModified: string;
  approvals: ApprovalStatus[];
}

export interface ApprovalStatus {
  approver: string;
  status: 'pending' | 'approved' | 'rejected' | 'delegated';
  timestamp?: string;
  comments?: string;
}

export interface MilestoneStatus {
  milestoneId: string;
  status: 'upcoming' | 'at_risk' | 'achieved' | 'missed';
  plannedDate: string;
  actualDate?: string;
  criteria: MilestoneCriteria[];
}

export interface MilestoneCriteria {
  description: string;
  status: 'met' | 'not_met' | 'partially_met';
  evidence?: string;
}

export interface ComplianceStatus {
  overallScore: number;
  phaseCompliance: { [phaseId: string]: number };
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  type: 'missing_artifact' | 'skipped_activity' | 'role_violation' | 'gate_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string[];
}

export class MethodologyEngine {
  private methodologies: Map<string, Methodology> = new Map();
  private projectMethodologies: Map<string, ProjectMethodology> = new Map();

  constructor() {
    this.initializeStandardMethodologies();
  }

  private initializeStandardMethodologies(): void {
    // Initialize standard methodologies
    this.createAgileScrum();
    this.createWaterfall();
    this.createKanban();
    this.createSAFe();
    this.createPRINCE2();
    this.createLeanStartup();
  }

  private createAgileScrum(): void {
    const scrum: Methodology = {
      id: 'agile-scrum',
      name: 'Agile Scrum',
      description: 'Iterative and incremental agile software development framework',
      category: 'agile',
      version: '2020',
      principles: [
        'Individuals and interactions over processes and tools',
        'Working software over comprehensive documentation',
        'Customer collaboration over contract negotiation',
        'Responding to change over following a plan'
      ],
      phases: [
        {
          id: 'product-backlog',
          name: 'Product Backlog Management',
          description: 'Continuous management and refinement of product backlog',
          order: 1,
          duration: { type: 'variable' },
          objectives: ['Define product vision', 'Maintain prioritized backlog'],
          deliverables: ['Product Backlog', 'User Stories'],
          entryConditions: ['Product vision defined'],
          exitConditions: ['Ready backlog items available'],
          activities: [
            {
              id: 'backlog-refinement',
              name: 'Backlog Refinement',
              description: 'Refine and estimate backlog items',
              type: 'planning',
              effort: 10,
              skills: ['Product Management', 'Business Analysis'],
              roles: ['Product Owner', 'Development Team'],
              inputs: ['User feedback', 'Market research'],
              outputs: ['Refined user stories', 'Story estimates'],
              tools: ['JIRA', 'Azure DevOps', 'Trello'],
              optional: false
            }
          ],
          dependencies: [],
          optional: false,
          iterative: true
        },
        {
          id: 'sprint',
          name: 'Sprint',
          description: 'Time-boxed iteration for delivering working software',
          order: 2,
          duration: { type: 'timeboxed', timebox: 14 },
          objectives: ['Deliver potentially shippable increment'],
          deliverables: ['Sprint Increment', 'Sprint Burndown'],
          entryConditions: ['Sprint Goal defined', 'Sprint Backlog created'],
          exitConditions: ['Increment completed', 'Sprint Review completed'],
          activities: [
            {
              id: 'sprint-planning',
              name: 'Sprint Planning',
              description: 'Plan the sprint and commit to sprint goal',
              type: 'planning',
              effort: 8,
              skills: ['Planning', 'Estimation'],
              roles: ['Scrum Master', 'Product Owner', 'Development Team'],
              inputs: ['Product Backlog', 'Team Velocity'],
              outputs: ['Sprint Goal', 'Sprint Backlog'],
              tools: ['Planning Poker', 'JIRA'],
              optional: false
            },
            {
              id: 'daily-development',
              name: 'Daily Development',
              description: 'Daily development work on sprint backlog items',
              type: 'execution',
              effort: 80,
              skills: ['Software Development', 'Testing'],
              roles: ['Development Team'],
              inputs: ['Sprint Backlog', 'Definition of Done'],
              outputs: ['Working Software', 'Test Results'],
              tools: ['IDE', 'Version Control', 'CI/CD'],
              optional: false
            }
          ],
          dependencies: ['product-backlog'],
          optional: false,
          iterative: true
        }
      ],
      artifacts: [
        {
          id: 'product-backlog',
          name: 'Product Backlog',
          description: 'Prioritized list of features and requirements',
          type: 'document',
          category: 'planning',
          format: 'digital',
          mandatory: true,
          phase: 'product-backlog',
          approval: { required: false, approvers: [], criteria: [], workflow: '' },
          versioning: { strategy: 'sequential', retention: 12, baseline: false }
        },
        {
          id: 'sprint-backlog',
          name: 'Sprint Backlog',
          description: 'Selected items for the current sprint',
          type: 'document',
          category: 'planning',
          format: 'digital',
          mandatory: true,
          phase: 'sprint',
          approval: { required: false, approvers: [], criteria: [], workflow: '' },
          versioning: { strategy: 'sequential', retention: 6, baseline: true }
        }
      ],
      roles: [
        {
          id: 'product-owner',
          name: 'Product Owner',
          description: 'Represents stakeholders and defines product requirements',
          type: 'primary',
          responsibilities: [
            'Manage product backlog',
            'Define acceptance criteria',
            'Prioritize features',
            'Accept completed work'
          ],
          skills: ['Product Management', 'Business Analysis', 'Communication'],
          authorities: ['Backlog prioritization', 'Sprint goal definition'],
          accountability: ['Product value', 'Stakeholder satisfaction'],
          reportingStructure: {
            reportsTo: 'stakeholders',
            manages: [],
            collaboratesWith: ['scrum-master', 'development-team']
          },
          optional: false
        },
        {
          id: 'scrum-master',
          name: 'Scrum Master',
          description: 'Facilitates scrum process and removes impediments',
          type: 'primary',
          responsibilities: [
            'Facilitate scrum ceremonies',
            'Remove impediments',
            'Coach team on agile practices',
            'Protect team from distractions'
          ],
          skills: ['Facilitation', 'Coaching', 'Conflict Resolution'],
          authorities: ['Process facilitation', 'Impediment escalation'],
          accountability: ['Team effectiveness', 'Process adherence'],
          reportingStructure: {
            reportsTo: 'management',
            manages: [],
            collaboratesWith: ['product-owner', 'development-team']
          },
          optional: false
        }
      ],
      ceremonies: [
        {
          id: 'daily-standup',
          name: 'Daily Standup',
          description: 'Daily synchronization meeting',
          type: 'standup',
          frequency: { type: 'daily', timeOfDay: '09:00' },
          duration: 15,
          participants: ['development-team', 'scrum-master'],
          facilitator: 'scrum-master',
          agenda: [
            {
              id: 'yesterday',
              title: 'What did you do yesterday?',
              duration: 5,
              owner: 'development-team',
              type: 'discussion'
            },
            {
              id: 'today',
              title: 'What will you do today?',
              duration: 5,
              owner: 'development-team',
              type: 'discussion'
            },
            {
              id: 'impediments',
              title: 'Any impediments?',
              duration: 5,
              owner: 'development-team',
              type: 'discussion'
            }
          ],
          outcomes: ['Shared understanding', 'Impediment identification'],
          artifacts: ['Sprint Burndown Update'],
          preparation: ['Review yesterday\'s work'],
          optional: false
        },
        {
          id: 'sprint-review',
          name: 'Sprint Review',
          description: 'Demo of completed work to stakeholders',
          type: 'demo',
          frequency: { type: 'milestone', milestones: ['sprint-end'] },
          duration: 60,
          participants: ['product-owner', 'development-team', 'stakeholders'],
          facilitator: 'product-owner',
          agenda: [
            {
              id: 'demo',
              title: 'Demonstrate completed features',
              duration: 40,
              owner: 'development-team',
              type: 'presentation'
            },
            {
              id: 'feedback',
              title: 'Gather stakeholder feedback',
              duration: 20,
              owner: 'product-owner',
              type: 'discussion'
            }
          ],
          outcomes: ['Stakeholder feedback', 'Product increment acceptance'],
          artifacts: ['Sprint Review Notes'],
          preparation: ['Prepare demo environment', 'Invite stakeholders'],
          optional: false
        }
      ],
      practices: [
        {
          id: 'user-stories',
          name: 'User Stories',
          description: 'Requirements expressed from user perspective',
          category: 'planning',
          type: 'technique',
          implementation: {
            steps: [
              {
                id: 'identify-user',
                description: 'Identify the user role',
                order: 1,
                duration: 30,
                owner: 'product-owner',
                inputs: ['User research'],
                outputs: ['User personas']
              },
              {
                id: 'define-need',
                description: 'Define what the user needs',
                order: 2,
                duration: 45,
                owner: 'product-owner',
                inputs: ['User personas', 'Business requirements'],
                outputs: ['User story']
              }
            ],
            tools: ['Story mapping tools', 'JIRA'],
            skills: ['Requirements analysis', 'User experience'],
            effort: 4,
            complexity: 'medium'
          },
          benefits: ['User-focused requirements', 'Clear acceptance criteria'],
          challenges: ['Balancing detail vs. flexibility', 'Non-functional requirements'],
          prerequisites: ['Understanding of users'],
          metrics: ['Story completion rate', 'Story point accuracy'],
          variations: [
            {
              id: 'epic-stories',
              name: 'Epic Stories',
              context: 'Large features requiring multiple sprints',
              modifications: ['Add epic level', 'Break down into smaller stories'],
              applicability: ['Complex features', 'Multi-team coordination']
            }
          ]
        }
      ],
      metrics: [
        {
          id: 'velocity',
          name: 'Team Velocity',
          description: 'Story points completed per sprint',
          category: 'velocity',
          type: 'lagging',
          calculation: {
            formula: 'SUM(completed_story_points) / sprint_duration',
            inputs: ['completed_story_points', 'sprint_duration'],
            dataSource: 'sprint_data',
            aggregation: 'average'
          },
          targets: [
            {
              type: 'trend',
              direction: 'stable'
            }
          ],
          frequency: 'sprint',
          visualization: {
            chartType: 'line',
            displayFormat: 'points/sprint',
            colors: ['#3B82F6'],
            thresholds: []
          }
        },
        {
          id: 'burndown',
          name: 'Sprint Burndown',
          description: 'Remaining work in the sprint',
          category: 'predictability',
          type: 'real_time',
          calculation: {
            formula: 'initial_sprint_points - completed_points',
            inputs: ['initial_sprint_points', 'completed_points'],
            dataSource: 'daily_progress',
            aggregation: 'sum'
          },
          targets: [
            {
              type: 'trend',
              direction: 'decrease'
            }
          ],
          frequency: 'daily',
          visualization: {
            chartType: 'burndown',
            displayFormat: 'story points',
            colors: ['#EF4444', '#10B981'],
            thresholds: [
              { value: 0, color: '#10B981', label: 'Complete' }
            ]
          }
        }
      ],
      gates: [
        {
          id: 'sprint-ready',
          name: 'Sprint Ready',
          description: 'Sprint backlog is ready for execution',
          phase: 'sprint',
          criteria: [
            {
              id: 'backlog-refined',
              name: 'Backlog Items Refined',
              type: 'checklist',
              condition: 'All sprint backlog items have estimates and acceptance criteria',
              weight: 50,
              mandatory: true,
              evidence: ['Story estimates', 'Acceptance criteria']
            },
            {
              id: 'capacity-confirmed',
              name: 'Team Capacity Confirmed',
              type: 'metric',
              condition: 'Sprint commitment <= team capacity',
              weight: 30,
              mandatory: true,
              evidence: ['Capacity planning']
            }
          ],
          approvers: ['scrum-master', 'development-team'],
          escalation: {
            levels: [
              { level: 1, approvers: ['product-owner'], authority: 'Scope adjustment' }
            ],
            timeouts: [24],
            notifications: ['team-lead']
          },
          automation: {
            enabled: true,
            triggers: ['sprint-planning-complete'],
            actions: ['calculate-capacity', 'validate-estimates'],
            conditions: ['all-stories-estimated']
          }
        }
      ],
      templates: [
        {
          id: 'user-story-template',
          name: 'User Story Template',
          description: 'Standard template for writing user stories',
          type: 'document',
          category: 'requirements',
          content: `
            As a {{user_role}}
            I want {{functionality}}
            So that {{benefit}}
            
            Acceptance Criteria:
            - {{criteria_1}}
            - {{criteria_2}}
            
            Definition of Done:
            - {{dod_1}}
            - {{dod_2}}
          `,
          variables: [
            { name: 'user_role', type: 'text', required: true },
            { name: 'functionality', type: 'text', required: true },
            { name: 'benefit', type: 'text', required: true },
            { name: 'criteria_1', type: 'text', required: true },
            { name: 'criteria_2', type: 'text', required: false }
          ],
          permissions: ['product-owner', 'business-analyst']
        }
      ],
      constraints: [
        {
          id: 'sprint-length',
          name: 'Sprint Length Constraint',
          description: 'Sprints must be 1-4 weeks long',
          type: 'time',
          condition: 'sprint_duration >= 1 AND sprint_duration <= 4',
          impact: 'blocking',
          mitigation: ['Adjust sprint length', 'Split large items']
        }
      ],
      adaptations: [
        {
          id: 'distributed-teams',
          name: 'Distributed Teams Adaptation',
          description: 'Modifications for geographically distributed teams',
          context: {
            organizationSize: 'medium',
            projectSize: 'medium',
            complexity: 'medium',
            industry: ['software'],
            regulations: [],
            culture: ['remote-friendly'],
            maturity: 'defined'
          },
          modifications: [
            {
              type: 'modify',
              target: 'ceremony',
              targetId: 'daily-standup',
              change: { duration: 30, tools: ['video-conferencing'] },
              justification: 'More time needed for distributed coordination'
            },
            {
              type: 'add',
              target: 'practice',
              targetId: 'async-communication',
              change: {
                name: 'Asynchronous Communication',
                description: 'Use async tools for continuous collaboration'
              },
              justification: 'Bridge time zone differences'
            }
          ],
          reasoning: 'Distributed teams need enhanced communication practices',
          impact: {
            effort: 3,
            risk: 'medium',
            benefits: ['Better global collaboration', 'Increased flexibility'],
            drawbacks: ['Communication overhead', 'Time zone challenges'],
            dependencies: ['Video conferencing tools', 'Collaboration platforms']
          }
        }
      ]
    };

    this.methodologies.set(scrum.id, scrum);
  }

  private createWaterfall(): void {
    const waterfall: Methodology = {
      id: 'waterfall',
      name: 'Waterfall',
      description: 'Sequential software development process',
      category: 'traditional',
      version: '1.0',
      principles: [
        'Sequential phase completion',
        'Comprehensive documentation',
        'Thorough planning and design',
        'Quality gates between phases'
      ],
      phases: [
        {
          id: 'requirements',
          name: 'Requirements Analysis',
          description: 'Gather and analyze all project requirements',
          order: 1,
          duration: { type: 'fixed', estimatedDays: 30 },
          objectives: ['Complete requirements capture', 'Stakeholder agreement'],
          deliverables: ['Requirements Specification', 'Traceability Matrix'],
          entryConditions: ['Project charter approved'],
          exitConditions: ['Requirements signed off'],
          activities: [
            {
              id: 'requirements-gathering',
              name: 'Requirements Gathering',
              description: 'Collect requirements from stakeholders',
              type: 'planning',
              effort: 40,
              skills: ['Business Analysis', 'Requirements Engineering'],
              roles: ['Business Analyst', 'Product Manager'],
              inputs: ['Project charter', 'Stakeholder interviews'],
              outputs: ['Requirements document'],
              tools: ['Requirements management tools'],
              optional: false
            }
          ],
          dependencies: [],
          optional: false,
          iterative: false
        },
        {
          id: 'design',
          name: 'System Design',
          description: 'Create detailed system architecture and design',
          order: 2,
          duration: { type: 'fixed', estimatedDays: 45 },
          objectives: ['Complete system design', 'Architecture definition'],
          deliverables: ['System Architecture', 'Detailed Design'],
          entryConditions: ['Requirements approved'],
          exitConditions: ['Design reviewed and approved'],
          activities: [],
          dependencies: ['requirements'],
          optional: false,
          iterative: false
        }
      ],
      artifacts: [],
      roles: [],
      ceremonies: [],
      practices: [],
      metrics: [],
      gates: [],
      templates: [],
      constraints: [],
      adaptations: []
    };

    this.methodologies.set(waterfall.id, waterfall);
  }

  private createKanban(): void {
    // Implementation for Kanban methodology
    const kanban: Methodology = {
      id: 'kanban',
      name: 'Kanban',
      description: 'Visual workflow management method',
      category: 'lean',
      version: '1.0',
      principles: [
        'Visualize work',
        'Limit work in progress',
        'Focus on flow',
        'Continuous improvement'
      ],
      phases: [],
      artifacts: [],
      roles: [],
      ceremonies: [],
      practices: [],
      metrics: [],
      gates: [],
      templates: [],
      constraints: [],
      adaptations: []
    };

    this.methodologies.set(kanban.id, kanban);
  }

  private createSAFe(): void {
    // Implementation for SAFe methodology
    const safe: Methodology = {
      id: 'safe',
      name: 'Scaled Agile Framework (SAFe)',
      description: 'Framework for scaling agile practices',
      category: 'agile',
      version: '5.1',
      principles: [],
      phases: [],
      artifacts: [],
      roles: [],
      ceremonies: [],
      practices: [],
      metrics: [],
      gates: [],
      templates: [],
      constraints: [],
      adaptations: []
    };

    this.methodologies.set(safe.id, safe);
  }

  private createPRINCE2(): void {
    // Implementation for PRINCE2 methodology
    const prince2: Methodology = {
      id: 'prince2',
      name: 'PRINCE2',
      description: 'Process-based project management method',
      category: 'traditional',
      version: '2017',
      principles: [],
      phases: [],
      artifacts: [],
      roles: [],
      ceremonies: [],
      practices: [],
      metrics: [],
      gates: [],
      templates: [],
      constraints: [],
      adaptations: []
    };

    this.methodologies.set(prince2.id, prince2);
  }

  private createLeanStartup(): void {
    // Implementation for Lean Startup methodology
    const leanStartup: Methodology = {
      id: 'lean-startup',
      name: 'Lean Startup',
      description: 'Methodology for developing businesses and products',
      category: 'lean',
      version: '1.0',
      principles: [],
      phases: [],
      artifacts: [],
      roles: [],
      ceremonies: [],
      practices: [],
      metrics: [],
      gates: [],
      templates: [],
      constraints: [],
      adaptations: []
    };

    this.methodologies.set(leanStartup.id, leanStartup);
  }

  // Public API methods
  getMethodology(id: string): Methodology | null {
    return this.methodologies.get(id) || null;
  }

  listMethodologies(category?: string): Methodology[] {
    const methodologies = Array.from(this.methodologies.values());
    return category ? methodologies.filter(m => m.category === category) : methodologies;
  }

  applyMethodologyToProject(projectId: string, methodologyId: string, adaptations: string[] = []): ProjectMethodology {
    const methodology = this.getMethodology(methodologyId);
    if (!methodology) {
      throw new Error(`Methodology ${methodologyId} not found`);
    }

    const projectMethodology: ProjectMethodology = {
      projectId,
      methodologyId,
      adaptations,
      customizations: [],
      progress: {
        currentPhase: methodology.phases[0]?.id || '',
        completedPhases: [],
        phaseProgress: {},
        overallProgress: 0,
        milestones: []
      },
      compliance: {
        overallScore: 100,
        phaseCompliance: {},
        violations: [],
        recommendations: []
      }
    };

    this.projectMethodologies.set(projectId, projectMethodology);
    return projectMethodology;
  }

  getProjectMethodology(projectId: string): ProjectMethodology | null {
    return this.projectMethodologies.get(projectId) || null;
  }

  updatePhaseProgress(projectId: string, phaseId: string, progress: Partial<PhaseProgress>): void {
    const projectMethodology = this.getProjectMethodology(projectId);
    if (!projectMethodology) {
      throw new Error(`Project methodology not found for project ${projectId}`);
    }

    if (!projectMethodology.progress.phaseProgress[phaseId]) {
      projectMethodology.progress.phaseProgress[phaseId] = {
        status: 'not_started',
        progressPercentage: 0,
        completedActivities: [],
        blockers: [],
        artifacts: []
      };
    }

    Object.assign(projectMethodology.progress.phaseProgress[phaseId], progress);
    
    // Update overall progress
    this.calculateOverallProgress(projectId);
  }

  private calculateOverallProgress(projectId: string): void {
    const projectMethodology = this.getProjectMethodology(projectId);
    const methodology = this.getMethodology(projectMethodology!.methodologyId);
    
    if (!projectMethodology || !methodology) return;

    const totalPhases = methodology.phases.length;
    const completedPhases = projectMethodology.progress.completedPhases.length;
    const currentPhaseProgress = projectMethodology.progress.phaseProgress[projectMethodology.progress.currentPhase]?.progressPercentage || 0;

    projectMethodology.progress.overallProgress = 
      ((completedPhases / totalPhases) * 100) + 
      ((currentPhaseProgress / 100) * (1 / totalPhases) * 100);
  }

  assessCompliance(projectId: string): ComplianceStatus {
    const projectMethodology = this.getProjectMethodology(projectId);
    const methodology = this.getMethodology(projectMethodology!.methodologyId);
    
    if (!projectMethodology || !methodology) {
      throw new Error(`Project or methodology not found`);
    }

    const violations: ComplianceViolation[] = [];
    const phaseCompliance: { [phaseId: string]: number } = {};

    // Assess each phase
    methodology.phases.forEach(phase => {
      const phaseProgress = projectMethodology.progress.phaseProgress[phase.id];
      let compliance = 100;

      if (!phaseProgress) {
        compliance = 0;
      } else {
        // Check for missing mandatory artifacts
        const mandatoryArtifacts = methodology.artifacts.filter(a => a.mandatory && a.phase === phase.id);
        const completedArtifacts = phaseProgress.artifacts.filter(a => a.status === 'completed' || a.status === 'approved');
        
        if (completedArtifacts.length < mandatoryArtifacts.length) {
          violations.push({
            type: 'missing_artifact',
            severity: 'high',
            description: `Missing mandatory artifacts in phase ${phase.name}`,
            impact: 'Quality and traceability compromised',
            remediation: ['Complete missing artifacts', 'Update phase status']
          });
          compliance -= 30;
        }

        // Check for skipped mandatory activities
        const mandatoryActivities = phase.activities.filter(a => !a.optional);
        const completedActivities = phaseProgress.completedActivities;
        
        const skippedMandatory = mandatoryActivities.filter(a => !completedActivities.includes(a.id));
        if (skippedMandatory.length > 0) {
          violations.push({
            type: 'skipped_activity',
            severity: 'medium',
            description: `Skipped mandatory activities in phase ${phase.name}`,
            impact: 'Process completeness affected',
            remediation: ['Complete skipped activities', 'Document exceptions']
          });
          compliance -= 20;
        }
      }

      phaseCompliance[phase.id] = Math.max(0, compliance);
    });

    const overallScore = Object.values(phaseCompliance).reduce((sum, score) => sum + score, 0) / Object.keys(phaseCompliance).length;

    const complianceStatus: ComplianceStatus = {
      overallScore,
      phaseCompliance,
      violations,
      recommendations: this.generateComplianceRecommendations(violations)
    };

    projectMethodology.compliance = complianceStatus;
    return complianceStatus;
  }

  private generateComplianceRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];

    if (violations.some(v => v.type === 'missing_artifact')) {
      recommendations.push('Implement artifact tracking and approval workflows');
      recommendations.push('Set up automated reminders for artifact deadlines');
    }

    if (violations.some(v => v.type === 'skipped_activity')) {
      recommendations.push('Review methodology training for team members');
      recommendations.push('Implement activity checklists and sign-offs');
    }

    if (violations.some(v => v.severity === 'critical' || v.severity === 'high')) {
      recommendations.push('Conduct immediate compliance review with stakeholders');
      recommendations.push('Consider methodology coaching for the team');
    }

    return recommendations;
  }

  suggestMethodology(projectContext: any): { methodologyId: string; confidence: number; reasoning: string }[] {
    const suggestions: { methodologyId: string; confidence: number; reasoning: string }[] = [];

    // Simple rule-based suggestion logic
    if (projectContext.type === 'software' && projectContext.changeFrequency === 'high') {
      suggestions.push({
        methodologyId: 'agile-scrum',
        confidence: 0.9,
        reasoning: 'High change frequency and software development favor iterative approaches'
      });
    }

    if (projectContext.requirements === 'well-defined' && projectContext.risk === 'low') {
      suggestions.push({
        methodologyId: 'waterfall',
        confidence: 0.8,
        reasoning: 'Well-defined requirements and low risk suit sequential approaches'
      });
    }

    if (projectContext.workflow === 'continuous' && projectContext.team === 'experienced') {
      suggestions.push({
        methodologyId: 'kanban',
        confidence: 0.85,
        reasoning: 'Continuous workflow and experienced team benefit from flow-based approaches'
      });
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  createCustomMethodology(baseMethodologyId: string, modifications: MethodologyModification[]): Methodology {
    const baseMethodology = this.getMethodology(baseMethodologyId);
    if (!baseMethodology) {
      throw new Error(`Base methodology ${baseMethodologyId} not found`);
    }

    // Deep clone the base methodology
    const customMethodology: Methodology = JSON.parse(JSON.stringify(baseMethodology));
    customMethodology.id = `custom-${Date.now()}`;
    customMethodology.name = `Custom ${baseMethodology.name}`;
    customMethodology.category = 'custom';

    // Apply modifications
    modifications.forEach(mod => {
      this.applyModification(customMethodology, mod);
    });

    this.methodologies.set(customMethodology.id, customMethodology);
    return customMethodology;
  }

  private applyModification(methodology: Methodology, modification: MethodologyModification): void {
    switch (modification.target) {
      case 'phase':
        this.modifyPhase(methodology, modification);
        break;
      case 'activity':
        this.modifyActivity(methodology, modification);
        break;
      case 'artifact':
        this.modifyArtifact(methodology, modification);
        break;
      case 'role':
        this.modifyRole(methodology, modification);
        break;
      case 'ceremony':
        this.modifyCeremony(methodology, modification);
        break;
      case 'practice':
        this.modifyPractice(methodology, modification);
        break;
    }
  }

  private modifyPhase(methodology: Methodology, modification: MethodologyModification): void {
    switch (modification.type) {
      case 'add':
        methodology.phases.push(modification.change);
        break;
      case 'remove':
        methodology.phases = methodology.phases.filter(p => p.id !== modification.targetId);
        break;
      case 'modify':
        const phase = methodology.phases.find(p => p.id === modification.targetId);
        if (phase) {
          Object.assign(phase, modification.change);
        }
        break;
      case 'replace':
        const index = methodology.phases.findIndex(p => p.id === modification.targetId);
        if (index !== -1) {
          methodology.phases[index] = modification.change;
        }
        break;
    }
  }

  private modifyActivity(methodology: Methodology, modification: MethodologyModification): void {
    // Implementation for activity modifications
  }

  private modifyArtifact(methodology: Methodology, modification: MethodologyModification): void {
    // Implementation for artifact modifications
  }

  private modifyRole(methodology: Methodology, modification: MethodologyModification): void {
    // Implementation for role modifications
  }

  private modifyCeremony(methodology: Methodology, modification: MethodologyModification): void {
    // Implementation for ceremony modifications
  }

  private modifyPractice(methodology: Methodology, modification: MethodologyModification): void {
    // Implementation for practice modifications
  }

  generateMethodologyReport(projectId: string): any {
    const projectMethodology = this.getProjectMethodology(projectId);
    const methodology = this.getMethodology(projectMethodology!.methodologyId);
    
    if (!projectMethodology || !methodology) {
      throw new Error(`Project or methodology not found`);
    }

    return {
      project: projectId,
      methodology: methodology.name,
      progress: projectMethodology.progress,
      compliance: this.assessCompliance(projectId),
      recommendations: this.generateProgressRecommendations(projectId),
      metrics: this.calculateMethodologyMetrics(projectId)
    };
  }

  private generateProgressRecommendations(projectId: string): string[] {
    // Implementation for progress-based recommendations
    return [
      'Consider increasing team velocity through pair programming',
      'Review and refine definition of done criteria',
      'Implement automated testing to improve quality gates'
    ];
  }

  private calculateMethodologyMetrics(projectId: string): any {
    // Implementation for methodology-specific metrics calculation
    return {
      cycleTime: 5.2,
      defectRate: 0.03,
      customerSatisfaction: 4.2,
      teamMorale: 8.1
    };
  }
}

export const methodologyEngine = new MethodologyEngine();