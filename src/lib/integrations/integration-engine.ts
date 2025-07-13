'use client';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  type: IntegrationType;
  provider: IntegrationProvider;
  version: string;
  status: IntegrationStatus;
  configuration: IntegrationConfig;
  authentication: AuthenticationConfig;
  endpoints: APIEndpoint[];
  webhooks: WebhookConfig[];
  mapping: DataMapping;
  sync: SyncConfiguration;
  monitoring: MonitoringConfig;
  usage: UsageMetrics;
  capabilities: IntegrationCapability[];
  marketplace: MarketplaceInfo;
  dependencies: string[];
  limitations: IntegrationLimitation[];
  pricing: PricingModel;
  support: SupportInfo;
}

export type IntegrationCategory = 
  | 'project_management' | 'development_tools' | 'communication' 
  | 'document_management' | 'time_tracking' | 'financial' 
  | 'hr_tools' | 'crm' | 'analytics' | 'security' 
  | 'infrastructure' | 'automation' | 'ai_ml' | 'business_intelligence';

export type IntegrationType = 
  | 'api' | 'webhook' | 'file_sync' | 'database' 
  | 'email' | 'sso' | 'plugin' | 'widget' | 'custom';

export type IntegrationStatus = 
  | 'available' | 'installed' | 'configured' | 'active' 
  | 'paused' | 'error' | 'deprecated' | 'beta';

export interface IntegrationProvider {
  id: string;
  name: string;
  website: string;
  logo: string;
  description: string;
  verified: boolean;
  rating: number;
  supportLevel: 'community' | 'basic' | 'premium' | 'enterprise';
  contact: ContactInfo;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website: string;
  documentation: string;
  support: string;
}

export interface IntegrationConfig {
  settings: { [key: string]: any };
  environment: 'development' | 'staging' | 'production';
  region?: string;
  customizations: Customization[];
  advanced: AdvancedConfig;
}

export interface Customization {
  id: string;
  type: 'field_mapping' | 'workflow' | 'ui' | 'business_rule';
  name: string;
  configuration: any;
  active: boolean;
}

export interface AdvancedConfig {
  rateLimiting: RateLimitConfig;
  retry: RetryConfig;
  timeout: number;
  compression: boolean;
  encryption: EncryptionConfig;
  logging: LoggingConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerMinute: number;
  burstLimit: number;
  strategy: 'fixed_window' | 'sliding_window' | 'token_bucket';
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  initialDelay: number;
  maxDelay: number;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyManagement: 'automatic' | 'manual';
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  retention: number;
  includePayload: boolean;
  maskedFields: string[];
}

export interface AuthenticationConfig {
  type: AuthType;
  credentials: { [key: string]: string };
  oauth?: OAuthConfig;
  apiKey?: APIKeyConfig;
  certificate?: CertificateConfig;
  refresh: RefreshConfig;
}

export type AuthType = 
  | 'none' | 'basic' | 'bearer_token' | 'api_key' 
  | 'oauth1' | 'oauth2' | 'jwt' | 'certificate' | 'custom';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
  pkce: boolean;
}

export interface APIKeyConfig {
  key: string;
  location: 'header' | 'query' | 'body';
  name: string;
}

export interface CertificateConfig {
  certificate: string;
  privateKey: string;
  passphrase?: string;
  format: 'pem' | 'p12' | 'jks';
}

export interface RefreshConfig {
  automatic: boolean;
  beforeExpiry: number;
  retryOnFailure: boolean;
}

export interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  description: string;
  parameters: EndpointParameter[];
  headers: { [key: string]: string };
  body?: RequestBody;
  response: ResponseSchema;
  rateLimit?: EndpointRateLimit;
  authentication: boolean;
  deprecated?: boolean;
}

export interface EndpointParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  location: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  description: string;
  default?: any;
  validation?: ParameterValidation;
}

export interface ParameterValidation {
  pattern?: string;
  min?: number;
  max?: number;
  enum?: any[];
  format?: string;
}

export interface RequestBody {
  contentType: string;
  schema: any;
  examples: { [key: string]: any };
}

export interface ResponseSchema {
  contentType: string;
  schema: any;
  examples: { [key: string]: any };
  errorCodes: ErrorCode[];
}

export interface ErrorCode {
  code: number;
  description: string;
  example: any;
}

export interface EndpointRateLimit {
  requestsPerMinute: number;
  concurrent: number;
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  authentication: WebhookAuth;
  retries: WebhookRetry;
  filters: WebhookFilter[];
  transformation: DataTransformation;
  status: 'active' | 'paused' | 'error';
}

export interface WebhookEvent {
  name: string;
  description: string;
  payload: any;
  frequency: 'real_time' | 'batched' | 'scheduled';
}

export interface WebhookAuth {
  type: 'none' | 'secret' | 'signature' | 'certificate';
  secret?: string;
  algorithm?: string;
}

export interface WebhookRetry {
  enabled: boolean;
  maxAttempts: number;
  backoffMultiplier: number;
  timeout: number;
}

export interface WebhookFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'regex';
  value: any;
}

export interface DataTransformation {
  enabled: boolean;
  script: string;
  language: 'javascript' | 'python' | 'jq';
  timeout: number;
}

export interface DataMapping {
  inbound: FieldMapping[];
  outbound: FieldMapping[];
  transformations: MappingTransformation[];
  validation: MappingValidation;
}

export interface FieldMapping {
  source: string;
  target: string;
  type: 'direct' | 'calculated' | 'lookup' | 'conditional';
  transformation?: string;
  defaultValue?: any;
  required: boolean;
}

export interface MappingTransformation {
  id: string;
  name: string;
  function: string;
  parameters: { [key: string]: any };
}

export interface MappingValidation {
  enabled: boolean;
  rules: ValidationRule[];
  onError: 'reject' | 'quarantine' | 'default';
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  condition: string;
  message: string;
}

export interface SyncConfiguration {
  enabled: boolean;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  frequency: SyncFrequency;
  mode: 'full' | 'incremental' | 'differential';
  conflict: ConflictResolution;
  filters: SyncFilter[];
  schedule: SyncSchedule;
  monitoring: SyncMonitoring;
}

export interface SyncFrequency {
  type: 'manual' | 'scheduled' | 'real_time' | 'event_driven';
  interval?: string;
  cron?: string;
  events?: string[];
}

export interface ConflictResolution {
  strategy: 'source_wins' | 'target_wins' | 'latest_wins' | 'merge' | 'manual';
  rules: ConflictRule[];
}

export interface ConflictRule {
  field: string;
  strategy: string;
  priority: number;
}

export interface SyncFilter {
  field: string;
  operator: string;
  value: any;
  active: boolean;
}

export interface SyncSchedule {
  timezone: string;
  window: TimeWindow;
  blackouts: TimeWindow[];
}

export interface TimeWindow {
  start: string;
  end: string;
  days: string[];
}

export interface SyncMonitoring {
  enabled: boolean;
  alerts: SyncAlert[];
  metrics: string[];
  dashboard: boolean;
}

export interface SyncAlert {
  condition: string;
  threshold: number;
  notification: string[];
  escalation: EscalationRule;
}

export interface EscalationRule {
  enabled: boolean;
  delay: number;
  recipients: string[];
}

export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricConfig[];
  alerts: AlertConfig[];
  dashboards: DashboardConfig[];
  logging: IntegrationLogging;
}

export interface MetricConfig {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  collection: MetricCollection;
}

export interface MetricCollection {
  interval: number;
  retention: number;
  aggregation: string[];
}

export interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  duration: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
  recipients: string[];
  template: string;
}

export interface DashboardConfig {
  name: string;
  widgets: DashboardWidget[];
  layout: string;
  permissions: string[];
}

export interface DashboardWidget {
  type: 'chart' | 'table' | 'metric' | 'log';
  config: any;
  position: { x: number; y: number; width: number; height: number };
}

export interface IntegrationLogging {
  level: 'debug' | 'info' | 'warn' | 'error';
  destinations: LogDestination[];
  format: 'json' | 'text' | 'structured';
  sampling: LogSampling;
}

export interface LogDestination {
  type: 'file' | 'database' | 'external';
  config: any;
}

export interface LogSampling {
  enabled: boolean;
  rate: number;
  conditions: string[];
}

export interface UsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  dataTransferred: number;
  lastSync: string;
  uptime: number;
  errors: ErrorMetric[];
}

export interface ErrorMetric {
  code: string;
  count: number;
  lastOccurrence: string;
  rate: number;
}

export interface IntegrationCapability {
  name: string;
  description: string;
  type: 'read' | 'write' | 'sync' | 'real_time' | 'batch';
  endpoints: string[];
  limitations: string[];
  permissions: string[];
}

export interface MarketplaceInfo {
  featured: boolean;
  rating: number;
  reviews: number;
  downloads: number;
  publishedDate: string;
  lastUpdated: string;
  verified: boolean;
  certification: CertificationInfo;
  screenshots: string[];
  documentation: DocumentationInfo;
}

export interface CertificationInfo {
  level: 'none' | 'basic' | 'verified' | 'certified' | 'enterprise';
  certifiedBy: string;
  validUntil: string;
  criteria: string[];
}

export interface DocumentationInfo {
  quickStart: string;
  apiReference: string;
  examples: DocumentationExample[];
  video: string[];
  faq: FAQItem[];
}

export interface DocumentationExample {
  title: string;
  description: string;
  code: string;
  language: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export interface IntegrationLimitation {
  type: 'rate_limit' | 'data_volume' | 'feature' | 'geographic' | 'temporal';
  description: string;
  impact: 'low' | 'medium' | 'high';
  workaround?: string;
}

export interface PricingModel {
  type: 'free' | 'freemium' | 'subscription' | 'usage_based' | 'enterprise';
  tiers: PricingTier[];
  currency: string;
  billing: BillingInfo;
}

export interface PricingTier {
  name: string;
  price: number;
  period: 'monthly' | 'yearly' | 'one_time';
  features: string[];
  limits: PricingLimit[];
  popular: boolean;
}

export interface PricingLimit {
  name: string;
  value: number;
  unit: string;
}

export interface BillingInfo {
  method: 'credit_card' | 'invoice' | 'purchase_order';
  trial: TrialInfo;
  refund: RefundPolicy;
}

export interface TrialInfo {
  available: boolean;
  duration: number;
  features: string[];
  limitations: string[];
}

export interface RefundPolicy {
  available: boolean;
  period: number;
  conditions: string[];
}

export interface SupportInfo {
  channels: SupportChannel[];
  hours: string;
  sla: SLAInfo;
  community: CommunityInfo;
}

export interface SupportChannel {
  type: 'email' | 'chat' | 'phone' | 'ticket' | 'forum';
  contact: string;
  availability: string;
  language: string[];
}

export interface SLAInfo {
  responseTime: { [severity: string]: string };
  resolution: { [severity: string]: string };
  uptime: number;
}

export interface CommunityInfo {
  forum: string;
  slack: string;
  discord: string;
  github: string;
  stackoverflow: string;
}

export interface IntegrationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  useCase: string;
  integrations: string[];
  configuration: any;
  deployment: DeploymentConfig;
  examples: TemplateExample[];
}

export interface DeploymentConfig {
  type: 'one_click' | 'guided' | 'manual';
  steps: DeploymentStep[];
  requirements: string[];
  validation: ValidationStep[];
}

export interface DeploymentStep {
  id: string;
  name: string;
  type: 'configuration' | 'authentication' | 'testing' | 'activation';
  instructions: string;
  automation: boolean;
  validation: string[];
}

export interface ValidationStep {
  name: string;
  test: string;
  expected: any;
  critical: boolean;
}

export interface TemplateExample {
  name: string;
  description: string;
  scenario: string;
  configuration: any;
}

export interface IntegrationWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions: WorkflowCondition[];
  variables: WorkflowVariable[];
  error_handling: ErrorHandling;
  monitoring: WorkflowMonitoring;
}

export interface WorkflowTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event' | 'api_call';
  configuration: any;
  conditions: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'api_call' | 'data_transform' | 'conditional' | 'loop' | 'custom';
  configuration: any;
  timeout: number;
  retry: RetryConfig;
  dependencies: string[];
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  trueSteps: string[];
  falseSteps: string[];
}

export interface WorkflowVariable {
  name: string;
  type: string;
  defaultValue: any;
  scope: 'workflow' | 'step' | 'global';
}

export interface ErrorHandling {
  strategy: 'fail_fast' | 'continue' | 'retry' | 'rollback';
  notification: string[];
  logging: boolean;
  cleanup: string[];
}

export interface WorkflowMonitoring {
  enabled: boolean;
  metrics: string[];
  logs: boolean;
  alerts: WorkflowAlert[];
}

export interface WorkflowAlert {
  condition: string;
  severity: string;
  notification: string[];
}

export class IntegrationEngine {
  private integrations: Map<string, Integration> = new Map();
  private templates: Map<string, IntegrationTemplate> = new Map();
  private workflows: Map<string, IntegrationWorkflow> = new Map();
  private marketplace: Integration[] = [];

  constructor() {
    this.initializeMarketplace();
  }

  private initializeMarketplace(): void {
    // Popular integrations for the marketplace
    const popularIntegrations: Partial<Integration>[] = [
      {
        id: 'jira-integration',
        name: 'Atlassian Jira',
        description: 'Sync issues, projects, and workflows with Jira',
        category: 'project_management',
        type: 'api',
        status: 'available',
        provider: {
          id: 'atlassian',
          name: 'Atlassian',
          website: 'https://atlassian.com',
          logo: '/integrations/atlassian-logo.png',
          description: 'Leading provider of team collaboration and productivity software',
          verified: true,
          rating: 4.8,
          supportLevel: 'enterprise',
          contact: {
            email: 'support@atlassian.com',
            website: 'https://atlassian.com',
            documentation: 'https://developer.atlassian.com',
            support: 'https://support.atlassian.com'
          }
        },
        capabilities: [
          {
            name: 'Issue Sync',
            description: 'Bidirectional synchronization of issues and tasks',
            type: 'sync',
            endpoints: ['/issues', '/projects'],
            limitations: [],
            permissions: ['read', 'write']
          },
          {
            name: 'Project Management',
            description: 'Full project lifecycle management',
            type: 'read',
            endpoints: ['/projects', '/versions'],
            limitations: [],
            permissions: ['read']
          }
        ],
        marketplace: {
          featured: true,
          rating: 4.8,
          reviews: 1247,
          downloads: 50000,
          publishedDate: '2023-01-15',
          lastUpdated: '2024-01-15',
          verified: true,
          certification: {
            level: 'enterprise',
            certifiedBy: 'Atlassian',
            validUntil: '2025-01-15',
            criteria: ['Security', 'Performance', 'Reliability']
          },
          screenshots: [],
          documentation: {
            quickStart: 'https://docs.example.com/jira-quickstart',
            apiReference: 'https://docs.example.com/jira-api',
            examples: [],
            video: [],
            faq: []
          }
        },
        pricing: {
          type: 'freemium',
          tiers: [
            {
              name: 'Free',
              price: 0,
              period: 'monthly',
              features: ['Basic sync', 'Up to 100 issues'],
              limits: [{ name: 'Issues', value: 100, unit: 'per month' }],
              popular: false
            },
            {
              name: 'Pro',
              price: 29,
              period: 'monthly',
              features: ['Unlimited sync', 'Advanced workflows', 'Priority support'],
              limits: [],
              popular: true
            }
          ],
          currency: 'USD',
          billing: {
            method: 'credit_card',
            trial: {
              available: true,
              duration: 14,
              features: ['All Pro features'],
              limitations: []
            },
            refund: {
              available: true,
              period: 30,
              conditions: ['No questions asked']
            }
          }
        }
      },
      {
        id: 'github-integration',
        name: 'GitHub',
        description: 'Connect repositories, issues, and pull requests',
        category: 'development_tools',
        type: 'api',
        status: 'available',
        provider: {
          id: 'github',
          name: 'GitHub',
          website: 'https://github.com',
          logo: '/integrations/github-logo.png',
          description: 'The world\'s leading software development platform',
          verified: true,
          rating: 4.9,
          supportLevel: 'enterprise',
          contact: {
            email: 'support@github.com',
            website: 'https://github.com',
            documentation: 'https://docs.github.com',
            support: 'https://support.github.com'
          }
        },
        marketplace: {
          featured: true,
          rating: 4.9,
          reviews: 2156,
          downloads: 75000,
          publishedDate: '2023-01-10',
          lastUpdated: '2024-01-12',
          verified: true,
          certification: {
            level: 'enterprise',
            certifiedBy: 'GitHub',
            validUntil: '2025-01-10',
            criteria: ['Security', 'Performance', 'Reliability', 'API Standards']
          },
          screenshots: [],
          documentation: {
            quickStart: 'https://docs.example.com/github-quickstart',
            apiReference: 'https://docs.example.com/github-api',
            examples: [],
            video: [],
            faq: []
          }
        },
        pricing: {
          type: 'free',
          tiers: [
            {
              name: 'Free',
              price: 0,
              period: 'monthly',
              features: ['Unlimited repositories', 'Issue tracking', 'PR management'],
              limits: [],
              popular: true
            }
          ],
          currency: 'USD',
          billing: {
            method: 'credit_card',
            trial: { available: false, duration: 0, features: [], limitations: [] },
            refund: { available: false, period: 0, conditions: [] }
          }
        }
      },
      {
        id: 'slack-integration',
        name: 'Slack',
        description: 'Team communication and project notifications',
        category: 'communication',
        type: 'webhook',
        status: 'available',
        provider: {
          id: 'slack',
          name: 'Slack Technologies',
          website: 'https://slack.com',
          logo: '/integrations/slack-logo.png',
          description: 'Business communication platform',
          verified: true,
          rating: 4.7,
          supportLevel: 'premium',
          contact: {
            email: 'support@slack.com',
            website: 'https://slack.com',
            documentation: 'https://api.slack.com',
            support: 'https://slack.com/help'
          }
        },
        marketplace: {
          featured: true,
          rating: 4.7,
          reviews: 892,
          downloads: 35000,
          publishedDate: '2023-02-01',
          lastUpdated: '2024-01-08',
          verified: true,
          certification: {
            level: 'verified',
            certifiedBy: 'Slack',
            validUntil: '2025-02-01',
            criteria: ['Security', 'User Experience']
          },
          screenshots: [],
          documentation: {
            quickStart: 'https://docs.example.com/slack-quickstart',
            apiReference: 'https://docs.example.com/slack-api',
            examples: [],
            video: [],
            faq: []
          }
        },
        pricing: {
          type: 'freemium',
          tiers: [
            {
              name: 'Free',
              price: 0,
              period: 'monthly',
              features: ['Basic notifications', 'Up to 5 channels'],
              limits: [{ name: 'Channels', value: 5, unit: 'total' }],
              popular: false
            },
            {
              name: 'Pro',
              price: 19,
              period: 'monthly',
              features: ['Unlimited notifications', 'Custom workflows', 'Advanced formatting'],
              limits: [],
              popular: true
            }
          ],
          currency: 'USD',
          billing: {
            method: 'credit_card',
            trial: {
              available: true,
              duration: 7,
              features: ['All Pro features'],
              limitations: []
            },
            refund: {
              available: true,
              period: 30,
              conditions: ['Within first month of subscription']
            }
          }
        }
      },
      {
        id: 'microsoft-teams',
        name: 'Microsoft Teams',
        description: 'Collaboration and video conferencing integration',
        category: 'communication',
        type: 'api',
        status: 'available',
        provider: {
          id: 'microsoft',
          name: 'Microsoft Corporation',
          website: 'https://microsoft.com',
          logo: '/integrations/microsoft-logo.png',
          description: 'Global technology company',
          verified: true,
          rating: 4.6,
          supportLevel: 'enterprise',
          contact: {
            email: 'support@microsoft.com',
            website: 'https://microsoft.com',
            documentation: 'https://docs.microsoft.com',
            support: 'https://support.microsoft.com'
          }
        },
        marketplace: {
          featured: true,
          rating: 4.6,
          reviews: 678,
          downloads: 28000,
          publishedDate: '2023-03-15',
          lastUpdated: '2024-01-05',
          verified: true,
          certification: {
            level: 'enterprise',
            certifiedBy: 'Microsoft',
            validUntil: '2025-03-15',
            criteria: ['Security', 'Compliance', 'Enterprise Standards']
          },
          screenshots: [],
          documentation: {
            quickStart: 'https://docs.example.com/teams-quickstart',
            apiReference: 'https://docs.example.com/teams-api',
            examples: [],
            video: [],
            faq: []
          }
        },
        pricing: {
          type: 'subscription',
          tiers: [
            {
              name: 'Basic',
              price: 15,
              period: 'monthly',
              features: ['Team notifications', 'Meeting integration', 'File sharing'],
              limits: [],
              popular: true
            },
            {
              name: 'Enterprise',
              price: 45,
              period: 'monthly',
              features: ['Advanced security', 'Custom apps', 'Analytics', 'Priority support'],
              limits: [],
              popular: false
            }
          ],
          currency: 'USD',
          billing: {
            method: 'credit_card',
            trial: {
              available: true,
              duration: 30,
              features: ['All Enterprise features'],
              limitations: []
            },
            refund: {
              available: true,
              period: 30,
              conditions: ['Pro-rated refund available']
            }
          }
        }
      },
      {
        id: 'google-workspace',
        name: 'Google Workspace',
        description: 'Gmail, Drive, Calendar, and Docs integration',
        category: 'document_management',
        type: 'api',
        status: 'available',
        provider: {
          id: 'google',
          name: 'Google LLC',
          website: 'https://google.com',
          logo: '/integrations/google-logo.png',
          description: 'Technology company specializing in Internet services',
          verified: true,
          rating: 4.8,
          supportLevel: 'enterprise',
          contact: {
            email: 'support@google.com',
            website: 'https://google.com',
            documentation: 'https://developers.google.com',
            support: 'https://support.google.com'
          }
        },
        marketplace: {
          featured: true,
          rating: 4.8,
          reviews: 1456,
          downloads: 62000,
          publishedDate: '2023-01-20',
          lastUpdated: '2024-01-10',
          verified: true,
          certification: {
            level: 'enterprise',
            certifiedBy: 'Google',
            validUntil: '2025-01-20',
            criteria: ['Security', 'Privacy', 'API Standards', 'Performance']
          },
          screenshots: [],
          documentation: {
            quickStart: 'https://docs.example.com/google-quickstart',
            apiReference: 'https://docs.example.com/google-api',
            examples: [],
            video: [],
            faq: []
          }
        },
        pricing: {
          type: 'freemium',
          tiers: [
            {
              name: 'Basic',
              price: 0,
              period: 'monthly',
              features: ['Calendar sync', 'Basic Drive integration'],
              limits: [{ name: 'Storage', value: 15, unit: 'GB' }],
              popular: false
            },
            {
              name: 'Business',
              price: 25,
              period: 'monthly',
              features: ['Full Workspace integration', 'Advanced security', 'Admin controls'],
              limits: [],
              popular: true
            }
          ],
          currency: 'USD',
          billing: {
            method: 'credit_card',
            trial: {
              available: true,
              duration: 14,
              features: ['All Business features'],
              limitations: []
            },
            refund: {
              available: true,
              period: 30,
              conditions: ['First month only']
            }
          }
        }
      }
    ];

    // Convert to full Integration objects and add to marketplace
    popularIntegrations.forEach((integration, index) => {
      const fullIntegration = this.createFullIntegration(integration, index);
      this.marketplace.push(fullIntegration);
    });
  }

  private createFullIntegration(partial: Partial<Integration>, index: number): Integration {
    return {
      id: partial.id || `integration-${index}`,
      name: partial.name || 'Unknown Integration',
      description: partial.description || '',
      category: partial.category || 'project_management',
      type: partial.type || 'api',
      provider: partial.provider || {
        id: 'unknown',
        name: 'Unknown Provider',
        website: '',
        logo: '',
        description: '',
        verified: false,
        rating: 0,
        supportLevel: 'community',
        contact: { email: '', website: '', documentation: '', support: '' }
      },
      version: '1.0.0',
      status: partial.status || 'available',
      configuration: {
        settings: {},
        environment: 'production',
        customizations: [],
        advanced: {
          rateLimiting: { enabled: true, requestsPerMinute: 100, burstLimit: 10, strategy: 'sliding_window' },
          retry: { enabled: true, maxAttempts: 3, backoffStrategy: 'exponential', initialDelay: 1000, maxDelay: 30000 },
          timeout: 30000,
          compression: true,
          encryption: { enabled: true, algorithm: 'AES-256', keyManagement: 'automatic' },
          logging: { level: 'info', retention: 30, includePayload: false, maskedFields: ['password', 'token'] }
        }
      },
      authentication: {
        type: 'oauth2',
        credentials: {},
        refresh: { automatic: true, beforeExpiry: 300, retryOnFailure: true }
      },
      endpoints: [],
      webhooks: [],
      mapping: {
        inbound: [],
        outbound: [],
        transformations: [],
        validation: { enabled: true, rules: [], onError: 'reject' }
      },
      sync: {
        enabled: true,
        direction: 'bidirectional',
        frequency: { type: 'scheduled', interval: '1h' },
        mode: 'incremental',
        conflict: { strategy: 'latest_wins', rules: [] },
        filters: [],
        schedule: { timezone: 'UTC', window: { start: '00:00', end: '23:59', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }, blackouts: [] },
        monitoring: { enabled: true, alerts: [], metrics: ['sync_duration', 'records_processed'], dashboard: true }
      },
      monitoring: {
        enabled: true,
        metrics: [],
        alerts: [],
        dashboards: [],
        logging: { level: 'info', destinations: [], format: 'json', sampling: { enabled: false, rate: 1, conditions: [] } }
      },
      usage: {
        totalRequests: Math.floor(Math.random() * 10000),
        successfulRequests: Math.floor(Math.random() * 9000),
        failedRequests: Math.floor(Math.random() * 1000),
        averageResponseTime: Math.floor(Math.random() * 1000),
        dataTransferred: Math.floor(Math.random() * 1000000),
        lastSync: new Date().toISOString(),
        uptime: 99.9,
        errors: []
      },
      capabilities: partial.capabilities || [],
      marketplace: partial.marketplace || {
        featured: false,
        rating: 0,
        reviews: 0,
        downloads: 0,
        publishedDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        verified: false,
        certification: { level: 'none', certifiedBy: '', validUntil: '', criteria: [] },
        screenshots: [],
        documentation: { quickStart: '', apiReference: '', examples: [], video: [], faq: [] }
      },
      dependencies: [],
      limitations: [],
      pricing: partial.pricing || {
        type: 'free',
        tiers: [],
        currency: 'USD',
        billing: {
          method: 'credit_card',
          trial: { available: false, duration: 0, features: [], limitations: [] },
          refund: { available: false, period: 0, conditions: [] }
        }
      },
      support: {
        channels: [],
        hours: '24/7',
        sla: { responseTime: {}, resolution: {}, uptime: 99.9 },
        community: { forum: '', slack: '', discord: '', github: '', stackoverflow: '' }
      }
    };
  }

  // Public API methods
  getMarketplace(filters?: any): Integration[] {
    let filtered = [...this.marketplace];

    if (filters) {
      if (filters.category) {
        filtered = filtered.filter(i => i.category === filters.category);
      }
      if (filters.featured) {
        filtered = filtered.filter(i => i.marketplace.featured);
      }
      if (filters.verified) {
        filtered = filtered.filter(i => i.provider.verified);
      }
      if (filters.priceType) {
        filtered = filtered.filter(i => i.pricing.type === filters.priceType);
      }
    }

    return filtered.sort((a, b) => {
      // Sort by featured, then rating, then downloads
      if (a.marketplace.featured && !b.marketplace.featured) return -1;
      if (!a.marketplace.featured && b.marketplace.featured) return 1;
      if (a.marketplace.rating !== b.marketplace.rating) return b.marketplace.rating - a.marketplace.rating;
      return b.marketplace.downloads - a.marketplace.downloads;
    });
  }

  getIntegration(id: string): Integration | null {
    return this.marketplace.find(i => i.id === id) || this.integrations.get(id) || null;
  }

  installIntegration(integrationId: string, config?: any): Integration {
    const marketplaceIntegration = this.marketplace.find(i => i.id === integrationId);
    if (!marketplaceIntegration) {
      throw new Error(`Integration ${integrationId} not found in marketplace`);
    }

    const installedIntegration = { ...marketplaceIntegration };
    installedIntegration.status = 'installed';
    
    if (config) {
      installedIntegration.configuration = { ...installedIntegration.configuration, ...config };
    }

    this.integrations.set(integrationId, installedIntegration);
    return installedIntegration;
  }

  configureIntegration(integrationId: string, config: Partial<IntegrationConfig>): Integration {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not installed`);
    }

    integration.configuration = { ...integration.configuration, ...config };
    integration.status = 'configured';
    
    this.integrations.set(integrationId, integration);
    return integration;
  }

  activateIntegration(integrationId: string): Integration {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not installed`);
    }

    integration.status = 'active';
    this.integrations.set(integrationId, integration);
    return integration;
  }

  getInstalledIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  searchMarketplace(query: string, filters?: any): Integration[] {
    const lowercaseQuery = query.toLowerCase();
    let results = this.marketplace.filter(integration => 
      integration.name.toLowerCase().includes(lowercaseQuery) ||
      integration.description.toLowerCase().includes(lowercaseQuery) ||
      integration.provider.name.toLowerCase().includes(lowercaseQuery)
    );

    if (filters) {
      if (filters.category) {
        results = results.filter(i => i.category === filters.category);
      }
      if (filters.type) {
        results = results.filter(i => i.type === filters.type);
      }
    }

    return results;
  }

  generateAPIDocumentation(integrationId: string): any {
    const integration = this.getIntegration(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    return {
      integration: {
        name: integration.name,
        version: integration.version,
        description: integration.description
      },
      authentication: integration.authentication,
      endpoints: integration.endpoints,
      webhooks: integration.webhooks,
      examples: this.generateCodeExamples(integration),
      sdks: this.getAvailableSDKs(integration)
    };
  }

  private generateCodeExamples(integration: Integration): any[] {
    return [
      {
        language: 'javascript',
        title: 'Basic API Call',
        code: `
const response = await fetch('${integration.endpoints[0]?.url || '/api/endpoint'}', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
        `.trim()
      },
      {
        language: 'python',
        title: 'Python Example',
        code: `
import requests

headers = {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.get('${integration.endpoints[0]?.url || '/api/endpoint'}', headers=headers)
data = response.json()
        `.trim()
      }
    ];
  }

  private getAvailableSDKs(integration: Integration): any[] {
    return [
      { language: 'JavaScript/Node.js', package: `@projectos/${integration.id}-sdk`, version: '1.0.0' },
      { language: 'Python', package: `projectos-${integration.id}`, version: '1.0.0' },
      { language: 'Go', package: `github.com/projectos/${integration.id}-go`, version: 'v1.0.0' }
    ];
  }

  getIntegrationMetrics(integrationId: string): UsageMetrics | null {
    const integration = this.getIntegration(integrationId);
    return integration?.usage || null;
  }

  testConnection(integrationId: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate connection test
      setTimeout(() => {
        resolve(Math.random() > 0.1); // 90% success rate
      }, 1000);
    });
  }
}

export const integrationEngine = new IntegrationEngine();