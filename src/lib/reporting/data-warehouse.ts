'use client';

export interface DataWarehouse {
  dimensions: Dimension[];
  measures: Measure[];
  factTables: FactTable[];
  cubes: DataCube[];
  connections: DataConnection[];
  etlPipelines: ETLPipeline[];
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  type: 'time' | 'geography' | 'product' | 'customer' | 'project' | 'resource' | 'custom';
  hierarchy: DimensionLevel[];
  attributes: DimensionAttribute[];
  businessKey: string;
  isSlowlyChanging: boolean;
  changeType?: 'type1' | 'type2' | 'type3';
}

export interface DimensionLevel {
  id: string;
  name: string;
  order: number;
  keyColumn: string;
  nameColumn: string;
  parentLevel?: string;
}

export interface DimensionAttribute {
  id: string;
  name: string;
  dataType: string;
  nullable: boolean;
  defaultValue?: any;
  description?: string;
}

export interface Measure {
  id: string;
  name: string;
  description: string;
  dataType: 'integer' | 'decimal' | 'currency' | 'percentage';
  aggregationType: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'distinct_count';
  format: string;
  formula?: string;
  isCalculated: boolean;
  dependencies?: string[];
}

export interface FactTable {
  id: string;
  name: string;
  description: string;
  schema: string;
  tableName: string;
  dimensions: string[];
  measures: string[];
  granularity: string;
  partitioning?: PartitionConfig;
  indexing?: IndexConfig[];
}

export interface PartitionConfig {
  type: 'range' | 'hash' | 'list';
  column: string;
  strategy: string;
  retention?: string;
}

export interface IndexConfig {
  name: string;
  columns: string[];
  type: 'btree' | 'hash' | 'bitmap' | 'columnstore';
  unique: boolean;
}

export interface DataCube {
  id: string;
  name: string;
  description: string;
  dimensions: string[];
  measures: string[];
  filters?: CubeFilter[];
  aggregations: CubeAggregation[];
  securityRules?: SecurityRule[];
  refreshSchedule?: RefreshSchedule;
}

export interface CubeFilter {
  dimension: string;
  operator: string;
  value: any;
  isParameter: boolean;
}

export interface CubeAggregation {
  level: string;
  dimensions: string[];
  measures: string[];
  precomputed: boolean;
}

export interface SecurityRule {
  id: string;
  type: 'row_level' | 'column_level' | 'cube_level';
  condition: string;
  roles: string[];
  users?: string[];
}

export interface RefreshSchedule {
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  time?: string;
  dependencies?: string[];
  incrementalRefresh: boolean;
}

export interface DataConnection {
  id: string;
  name: string;
  type: 'database' | 'api' | 'file' | 'stream';
  config: ConnectionConfig;
  authentication: AuthConfig;
  healthCheck: HealthCheckConfig;
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  url?: string;
  timeout?: number;
  poolSize?: number;
  ssl?: boolean;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'oauth' | 'certificate' | 'kerberos';
  credentials?: { [key: string]: string };
  tokenEndpoint?: string;
  refreshToken?: string;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number;
  timeout: number;
  retryCount: number;
  query?: string;
}

export interface ETLPipeline {
  id: string;
  name: string;
  description: string;
  source: DataSource;
  transformations: Transformation[];
  destination: DataDestination;
  schedule: ETLSchedule;
  monitoring: ETLMonitoring;
  errorHandling: ErrorHandling;
}

export interface DataSource {
  connectionId: string;
  query?: string;
  tables?: string[];
  incremental: boolean;
  watermark?: WatermarkConfig;
}

export interface WatermarkConfig {
  column: string;
  initialValue: any;
  strategy: 'max' | 'checkpoint' | 'custom';
}

export interface Transformation {
  id: string;
  type: 'filter' | 'map' | 'aggregate' | 'join' | 'lookup' | 'custom';
  config: TransformationConfig;
  order: number;
}

export interface TransformationConfig {
  condition?: string;
  mapping?: { [key: string]: string };
  aggregations?: AggregationConfig[];
  joinConfig?: JoinConfig;
  lookupConfig?: LookupConfig;
  customCode?: string;
}

export interface AggregationConfig {
  groupBy: string[];
  measures: { column: string; function: string; alias: string }[];
}

export interface JoinConfig {
  type: 'inner' | 'left' | 'right' | 'full';
  rightTable: string;
  conditions: JoinCondition[];
}

export interface JoinCondition {
  leftColumn: string;
  operator: string;
  rightColumn: string;
}

export interface LookupConfig {
  lookupTable: string;
  keyColumn: string;
  valueColumns: string[];
  caching: boolean;
}

export interface DataDestination {
  connectionId: string;
  table: string;
  writeMode: 'append' | 'overwrite' | 'upsert';
  partitionBy?: string[];
  clustering?: string[];
}

export interface ETLSchedule {
  type: 'manual' | 'time_based' | 'event_based' | 'dependency_based';
  cron?: string;
  dependencies?: string[];
  triggers?: EventTrigger[];
}

export interface EventTrigger {
  type: 'file_arrival' | 'api_webhook' | 'database_change';
  config: { [key: string]: any };
}

export interface ETLMonitoring {
  enabled: boolean;
  metrics: string[];
  alerts: AlertConfig[];
  logging: LoggingConfig;
}

export interface AlertConfig {
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  channels: string[];
  throttle?: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warning' | 'error';
  destination: 'file' | 'database' | 'external';
  retention: number;
}

export interface ErrorHandling {
  strategy: 'fail_fast' | 'skip_errors' | 'retry' | 'quarantine';
  retryConfig?: RetryConfig;
  quarantineConfig?: QuarantineConfig;
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  initialDelay: number;
  maxDelay?: number;
}

export interface QuarantineConfig {
  table: string;
  includeOriginal: boolean;
  errorColumns: string[];
}

export interface DataLineage {
  nodes: LineageNode[];
  edges: LineageEdge[];
  impact: ImpactAnalysis;
}

export interface LineageNode {
  id: string;
  type: 'source' | 'transformation' | 'destination' | 'report';
  name: string;
  metadata: { [key: string]: any };
}

export interface LineageEdge {
  from: string;
  to: string;
  type: 'data_flow' | 'dependency' | 'usage';
  metadata?: { [key: string]: any };
}

export interface ImpactAnalysis {
  upstream: string[];
  downstream: string[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface DataQuality {
  rules: QualityRule[];
  checks: QualityCheck[];
  metrics: QualityMetric[];
  thresholds: QualityThreshold[];
}

export interface QualityRule {
  id: string;
  name: string;
  description: string;
  type: 'completeness' | 'uniqueness' | 'validity' | 'accuracy' | 'consistency' | 'timeliness';
  expression: string;
  severity: 'warning' | 'error' | 'critical';
  scope: 'column' | 'row' | 'table' | 'cross_table';
}

export interface QualityCheck {
  id: string;
  ruleId: string;
  target: string;
  schedule: string;
  lastRun?: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  score?: number;
}

export interface QualityMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: number;
  timestamp: string;
}

export interface QualityThreshold {
  ruleId: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';
  value: number;
  action: 'alert' | 'block' | 'quarantine';
}

export class DataWarehouseEngine {
  private warehouse: DataWarehouse;
  private lineage: DataLineage;
  private quality: DataQuality;

  constructor() {
    this.warehouse = this.initializeWarehouse();
    this.lineage = this.initializeLineage();
    this.quality = this.initializeQuality();
  }

  private initializeWarehouse(): DataWarehouse {
    return {
      dimensions: this.createStandardDimensions(),
      measures: this.createStandardMeasures(),
      factTables: this.createFactTables(),
      cubes: this.createDataCubes(),
      connections: this.createConnections(),
      etlPipelines: this.createETLPipelines()
    };
  }

  private createStandardDimensions(): Dimension[] {
    return [
      {
        id: 'dim_time',
        name: 'Time',
        description: 'Standard time dimension with multiple hierarchies',
        type: 'time',
        hierarchy: [
          { id: 'year', name: 'Year', order: 1, keyColumn: 'year_key', nameColumn: 'year_name' },
          { id: 'quarter', name: 'Quarter', order: 2, keyColumn: 'quarter_key', nameColumn: 'quarter_name', parentLevel: 'year' },
          { id: 'month', name: 'Month', order: 3, keyColumn: 'month_key', nameColumn: 'month_name', parentLevel: 'quarter' },
          { id: 'week', name: 'Week', order: 4, keyColumn: 'week_key', nameColumn: 'week_name', parentLevel: 'month' },
          { id: 'day', name: 'Day', order: 5, keyColumn: 'day_key', nameColumn: 'day_name', parentLevel: 'week' }
        ],
        attributes: [
          { id: 'is_weekend', name: 'Is Weekend', dataType: 'boolean', nullable: false },
          { id: 'is_holiday', name: 'Is Holiday', dataType: 'boolean', nullable: false },
          { id: 'fiscal_year', name: 'Fiscal Year', dataType: 'integer', nullable: false }
        ],
        businessKey: 'date',
        isSlowlyChanging: false
      },
      {
        id: 'dim_project',
        name: 'Project',
        description: 'Project dimension with organizational hierarchy',
        type: 'project',
        hierarchy: [
          { id: 'portfolio', name: 'Portfolio', order: 1, keyColumn: 'portfolio_key', nameColumn: 'portfolio_name' },
          { id: 'program', name: 'Program', order: 2, keyColumn: 'program_key', nameColumn: 'program_name', parentLevel: 'portfolio' },
          { id: 'project', name: 'Project', order: 3, keyColumn: 'project_key', nameColumn: 'project_name', parentLevel: 'program' }
        ],
        attributes: [
          { id: 'project_status', name: 'Project Status', dataType: 'string', nullable: false },
          { id: 'project_manager', name: 'Project Manager', dataType: 'string', nullable: true },
          { id: 'start_date', name: 'Start Date', dataType: 'date', nullable: false },
          { id: 'end_date', name: 'End Date', dataType: 'date', nullable: true },
          { id: 'budget', name: 'Budget', dataType: 'decimal', nullable: false }
        ],
        businessKey: 'project_code',
        isSlowlyChanging: true,
        changeType: 'type2'
      },
      {
        id: 'dim_resource',
        name: 'Resource',
        description: 'Human and non-human resources',
        type: 'resource',
        hierarchy: [
          { id: 'organization', name: 'Organization', order: 1, keyColumn: 'org_key', nameColumn: 'org_name' },
          { id: 'department', name: 'Department', order: 2, keyColumn: 'dept_key', nameColumn: 'dept_name', parentLevel: 'organization' },
          { id: 'team', name: 'Team', order: 3, keyColumn: 'team_key', nameColumn: 'team_name', parentLevel: 'department' },
          { id: 'resource', name: 'Resource', order: 4, keyColumn: 'resource_key', nameColumn: 'resource_name', parentLevel: 'team' }
        ],
        attributes: [
          { id: 'resource_type', name: 'Resource Type', dataType: 'string', nullable: false },
          { id: 'skill_level', name: 'Skill Level', dataType: 'string', nullable: true },
          { id: 'hourly_rate', name: 'Hourly Rate', dataType: 'decimal', nullable: true },
          { id: 'location', name: 'Location', dataType: 'string', nullable: true }
        ],
        businessKey: 'resource_id',
        isSlowlyChanging: true,
        changeType: 'type2'
      }
    ];
  }

  private createStandardMeasures(): Measure[] {
    return [
      {
        id: 'project_count',
        name: 'Project Count',
        description: 'Total number of projects',
        dataType: 'integer',
        aggregationType: 'count',
        format: '#,##0',
        isCalculated: false
      },
      {
        id: 'budget_amount',
        name: 'Budget Amount',
        description: 'Total budget allocated',
        dataType: 'currency',
        aggregationType: 'sum',
        format: '$#,##0',
        isCalculated: false
      },
      {
        id: 'actual_cost',
        name: 'Actual Cost',
        description: 'Actual cost incurred',
        dataType: 'currency',
        aggregationType: 'sum',
        format: '$#,##0',
        isCalculated: false
      },
      {
        id: 'budget_variance',
        name: 'Budget Variance',
        description: 'Difference between budget and actual cost',
        dataType: 'currency',
        aggregationType: 'sum',
        format: '$#,##0',
        isCalculated: true,
        formula: '[budget_amount] - [actual_cost]',
        dependencies: ['budget_amount', 'actual_cost']
      },
      {
        id: 'resource_hours',
        name: 'Resource Hours',
        description: 'Total hours allocated to resources',
        dataType: 'decimal',
        aggregationType: 'sum',
        format: '#,##0.0',
        isCalculated: false
      },
      {
        id: 'utilization_rate',
        name: 'Utilization Rate',
        description: 'Resource utilization percentage',
        dataType: 'percentage',
        aggregationType: 'avg',
        format: '0.0%',
        isCalculated: true,
        formula: '[resource_hours] / [available_hours]',
        dependencies: ['resource_hours', 'available_hours']
      }
    ];
  }

  private createFactTables(): FactTable[] {
    return [
      {
        id: 'fact_project_performance',
        name: 'Project Performance',
        description: 'Daily project performance metrics',
        schema: 'warehouse',
        tableName: 'fact_project_performance',
        dimensions: ['dim_time', 'dim_project', 'dim_resource'],
        measures: ['budget_amount', 'actual_cost', 'resource_hours'],
        granularity: 'daily',
        partitioning: {
          type: 'range',
          column: 'date_key',
          strategy: 'monthly',
          retention: '7 years'
        },
        indexing: [
          {
            name: 'idx_project_date',
            columns: ['project_key', 'date_key'],
            type: 'btree',
            unique: false
          }
        ]
      },
      {
        id: 'fact_resource_allocation',
        name: 'Resource Allocation',
        description: 'Resource allocation and utilization facts',
        schema: 'warehouse',
        tableName: 'fact_resource_allocation',
        dimensions: ['dim_time', 'dim_project', 'dim_resource'],
        measures: ['resource_hours', 'utilization_rate'],
        granularity: 'daily',
        partitioning: {
          type: 'range',
          column: 'date_key',
          strategy: 'monthly',
          retention: '5 years'
        }
      }
    ];
  }

  private createDataCubes(): DataCube[] {
    return [
      {
        id: 'cube_executive_summary',
        name: 'Executive Summary',
        description: 'High-level executive metrics and KPIs',
        dimensions: ['dim_time', 'dim_project'],
        measures: ['project_count', 'budget_amount', 'actual_cost', 'budget_variance'],
        aggregations: [
          {
            level: 'monthly',
            dimensions: ['dim_time.month', 'dim_project.portfolio'],
            measures: ['project_count', 'budget_amount', 'actual_cost'],
            precomputed: true
          },
          {
            level: 'quarterly',
            dimensions: ['dim_time.quarter', 'dim_project.portfolio'],
            measures: ['project_count', 'budget_amount', 'actual_cost'],
            precomputed: true
          }
        ],
        refreshSchedule: {
          frequency: 'daily',
          time: '06:00',
          incrementalRefresh: true
        }
      },
      {
        id: 'cube_resource_analytics',
        name: 'Resource Analytics',
        description: 'Resource utilization and performance analytics',
        dimensions: ['dim_time', 'dim_resource', 'dim_project'],
        measures: ['resource_hours', 'utilization_rate'],
        aggregations: [
          {
            level: 'weekly',
            dimensions: ['dim_time.week', 'dim_resource.department'],
            measures: ['resource_hours', 'utilization_rate'],
            precomputed: true
          }
        ],
        refreshSchedule: {
          frequency: 'hourly',
          incrementalRefresh: true
        }
      }
    ];
  }

  private createConnections(): DataConnection[] {
    return [
      {
        id: 'conn_operational_db',
        name: 'Operational Database',
        type: 'database',
        config: {
          host: 'localhost',
          port: 5432,
          database: 'projectos',
          schema: 'public',
          timeout: 30000,
          poolSize: 10,
          ssl: true
        },
        authentication: {
          type: 'basic',
          credentials: {
            username: 'etl_user',
            password: '${ETL_PASSWORD}'
          }
        },
        healthCheck: {
          enabled: true,
          interval: 300,
          timeout: 10,
          retryCount: 3,
          query: 'SELECT 1'
        }
      },
      {
        id: 'conn_warehouse_db',
        name: 'Data Warehouse',
        type: 'database',
        config: {
          host: 'warehouse.internal',
          port: 5432,
          database: 'warehouse',
          schema: 'warehouse',
          timeout: 60000,
          poolSize: 20,
          ssl: true
        },
        authentication: {
          type: 'certificate'
        },
        healthCheck: {
          enabled: true,
          interval: 60,
          timeout: 15,
          retryCount: 2
        }
      }
    ];
  }

  private createETLPipelines(): ETLPipeline[] {
    return [
      {
        id: 'etl_project_daily',
        name: 'Daily Project Data Load',
        description: 'Load daily project performance data from operational systems',
        source: {
          connectionId: 'conn_operational_db',
          query: `
            SELECT 
              p.id as project_id,
              p.name as project_name,
              p.status,
              p.budget,
              p.start_date,
              p.end_date,
              CURRENT_DATE as load_date
            FROM projects p
            WHERE p.updated_at >= $watermark
          `,
          incremental: true,
          watermark: {
            column: 'updated_at',
            initialValue: '1900-01-01',
            strategy: 'max'
          }
        },
        transformations: [
          {
            id: 'validate_data',
            type: 'filter',
            config: {
              condition: 'project_id IS NOT NULL AND budget > 0'
            },
            order: 1
          },
          {
            id: 'calculate_metrics',
            type: 'custom',
            config: {
              customCode: `
                df['budget_per_day'] = df['budget'] / df['duration_days']
                df['status_category'] = df['status'].map(status_mapping)
              `
            },
            order: 2
          }
        ],
        destination: {
          connectionId: 'conn_warehouse_db',
          table: 'fact_project_performance',
          writeMode: 'upsert',
          partitionBy: ['load_date']
        },
        schedule: {
          type: 'time_based',
          cron: '0 2 * * *'
        },
        monitoring: {
          enabled: true,
          metrics: ['rows_processed', 'execution_time', 'error_count'],
          alerts: [
            {
              condition: 'error_count > 0',
              severity: 'error',
              channels: ['email', 'slack']
            },
            {
              condition: 'execution_time > 3600',
              severity: 'warning',
              channels: ['slack']
            }
          ],
          logging: {
            level: 'info',
            destination: 'database',
            retention: 90
          }
        },
        errorHandling: {
          strategy: 'quarantine',
          quarantineConfig: {
            table: 'quarantine_project_data',
            includeOriginal: true,
            errorColumns: ['error_message', 'error_timestamp']
          }
        }
      }
    ];
  }

  private initializeLineage(): DataLineage {
    return {
      nodes: [
        {
          id: 'source_projects',
          type: 'source',
          name: 'Projects Table',
          metadata: { table: 'projects', schema: 'public' }
        },
        {
          id: 'etl_project_daily',
          type: 'transformation',
          name: 'Daily Project ETL',
          metadata: { pipeline: 'etl_project_daily' }
        },
        {
          id: 'fact_project_performance',
          type: 'destination',
          name: 'Project Performance Fact',
          metadata: { table: 'fact_project_performance', schema: 'warehouse' }
        },
        {
          id: 'cube_executive_summary',
          type: 'destination',
          name: 'Executive Summary Cube',
          metadata: { cube: 'cube_executive_summary' }
        }
      ],
      edges: [
        { from: 'source_projects', to: 'etl_project_daily', type: 'data_flow' },
        { from: 'etl_project_daily', to: 'fact_project_performance', type: 'data_flow' },
        { from: 'fact_project_performance', to: 'cube_executive_summary', type: 'dependency' }
      ],
      impact: {
        upstream: ['source_projects', 'etl_project_daily'],
        downstream: ['fact_project_performance', 'cube_executive_summary'],
        criticality: 'high'
      }
    };
  }

  private initializeQuality(): DataQuality {
    return {
      rules: [
        {
          id: 'completeness_project_id',
          name: 'Project ID Completeness',
          description: 'Project ID must not be null',
          type: 'completeness',
          expression: 'project_id IS NOT NULL',
          severity: 'error',
          scope: 'column'
        },
        {
          id: 'validity_budget',
          name: 'Budget Validity',
          description: 'Budget must be positive',
          type: 'validity',
          expression: 'budget > 0',
          severity: 'warning',
          scope: 'column'
        },
        {
          id: 'uniqueness_project_date',
          name: 'Project Date Uniqueness',
          description: 'One record per project per date',
          type: 'uniqueness',
          expression: 'COUNT(*) = 1 GROUP BY project_id, date_key',
          severity: 'error',
          scope: 'table'
        }
      ],
      checks: [],
      metrics: [],
      thresholds: [
        {
          ruleId: 'completeness_project_id',
          operator: 'gte',
          value: 100,
          action: 'block'
        },
        {
          ruleId: 'validity_budget',
          operator: 'gte',
          value: 95,
          action: 'alert'
        }
      ]
    };
  }

  // Public API methods
  getDimension(id: string): Dimension | null {
    return this.warehouse.dimensions.find(d => d.id === id) || null;
  }

  getMeasure(id: string): Measure | null {
    return this.warehouse.measures.find(m => m.id === id) || null;
  }

  getDataCube(id: string): DataCube | null {
    return this.warehouse.cubes.find(c => c.id === id) || null;
  }

  getETLPipeline(id: string): ETLPipeline | null {
    return this.warehouse.etlPipelines.find(p => p.id === id) || null;
  }

  getLineage(): DataLineage {
    return this.lineage;
  }

  getQualityRules(): QualityRule[] {
    return this.quality.rules;
  }

  async executeETLPipeline(pipelineId: string): Promise<void> {
    const pipeline = this.getETLPipeline(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    // Simulate ETL execution
    console.log(`Executing ETL pipeline: ${pipeline.name}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log(`ETL pipeline completed: ${pipeline.name}`);
  }

  async refreshDataCube(cubeId: string): Promise<void> {
    const cube = this.getDataCube(cubeId);
    if (!cube) {
      throw new Error(`Data cube ${cubeId} not found`);
    }

    // Simulate cube refresh
    console.log(`Refreshing data cube: ${cube.name}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Data cube refreshed: ${cube.name}`);
  }

  async runQualityChecks(tableId: string): Promise<QualityCheck[]> {
    const relevantRules = this.quality.rules.filter(rule => 
      rule.scope === 'table' || rule.scope === 'column'
    );

    const checks: QualityCheck[] = relevantRules.map(rule => ({
      id: `check_${rule.id}_${Date.now()}`,
      ruleId: rule.id,
      target: tableId,
      schedule: 'on-demand',
      lastRun: new Date().toISOString(),
      status: Math.random() > 0.8 ? 'failed' : 'passed',
      score: Math.random() * 100
    }));

    return checks;
  }

  getWarehouseMetadata(): DataWarehouse {
    return this.warehouse;
  }
}

export const dataWarehouse = new DataWarehouseEngine();