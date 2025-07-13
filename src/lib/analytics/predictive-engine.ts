export interface ProjectData {
  id: string;
  name: string;
  status: string;
  progress: number;
  startDate: string;
  dueDate: string;
  budget?: number;
  actualCost?: number;
  teamSize: number;
  priority: string;
  methodology: string;
  estimatedHours?: number;
  actualHours?: number;
  tasks: TaskData[];
}

export interface TaskData {
  id: string;
  title: string;
  status: string;
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  priority: string;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
}

export interface PredictiveInsight {
  id: string;
  type: 'risk' | 'opportunity' | 'forecast' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: string;
  data: any;
  actionable: boolean;
  timeframe: string;
}

export interface ForecastResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeframe: string;
  factors: string[];
}

export class PredictiveAnalyticsEngine {
  private projects: ProjectData[] = [];
  private tasks: TaskData[] = [];

  constructor(projects: ProjectData[] = [], tasks: TaskData[] = []) {
    this.projects = projects;
    this.tasks = tasks;
  }

  updateData(projects: ProjectData[], tasks: TaskData[]) {
    this.projects = projects;
    this.tasks = tasks;
  }

  // Main prediction methods
  generateInsights(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    insights.push(...this.analyzeCompletionRisks());
    insights.push(...this.analyzeBudgetForecasts());
    insights.push(...this.analyzeResourceOptimization());
    insights.push(...this.analyzeVelocityTrends());
    insights.push(...this.analyzeQualityMetrics());
    insights.push(...this.analyzeCapacityPlanning());

    return insights.sort((a, b) => {
      // Sort by impact (high first) then by confidence
      if (a.impact !== b.impact) {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return b.confidence - a.confidence;
    });
  }

  forecastMetrics(): ForecastResult[] {
    return [
      this.forecastProjectCompletions(),
      this.forecastBudgetUtilization(),
      this.forecastTeamVelocity(),
      this.forecastResourceDemand(),
      this.forecastRiskProbability()
    ].filter(Boolean) as ForecastResult[];
  }

  // Risk Analysis
  private analyzeCompletionRisks(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    const now = new Date();

    // Analyze overdue risk
    const projectsAtRisk = this.projects.filter(project => {
      const dueDate = new Date(project.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const expectedProgress = this.calculateExpectedProgress(project);
      
      return daysUntilDue <= 30 && project.progress < expectedProgress * 0.8;
    });

    if (projectsAtRisk.length > 0) {
      insights.push({
        id: 'completion-risk',
        type: 'risk',
        title: 'Project Completion Risk Detected',
        description: `${projectsAtRisk.length} projects are at risk of missing their deadlines based on current velocity.`,
        confidence: 85,
        impact: 'high',
        category: 'schedule_management',
        data: { projectsAtRisk: projectsAtRisk.map(p => p.name) },
        actionable: true,
        timeframe: 'next_30_days'
      });
    }

    // Analyze scope creep risk
    const scopeCreepRisk = this.analyzeScopeCreepRisk();
    if (scopeCreepRisk.confidence > 60) {
      insights.push(scopeCreepRisk);
    }

    return insights;
  }

  private analyzeBudgetForecasts(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    const projectsWithBudget = this.projects.filter(p => p.budget && p.actualCost);
    if (projectsWithBudget.length === 0) return insights;

    const avgBurnRate = projectsWithBudget.reduce((sum, project) => {
      const burnRate = (project.actualCost || 0) / Math.max(project.progress, 1) * 100;
      return sum + burnRate;
    }, 0) / projectsWithBudget.length;

    const projectedOverruns = projectsWithBudget.filter(project => {
      const projectedCost = avgBurnRate * (project.budget || 0) / 100;
      return projectedCost > (project.budget || 0) * 1.1; // 10% over budget
    });

    if (projectedOverruns.length > 0) {
      insights.push({
        id: 'budget-overrun-risk',
        type: 'risk',
        title: 'Budget Overrun Risk',
        description: `${projectedOverruns.length} projects are projected to exceed budget by 10% or more.`,
        confidence: 78,
        impact: 'high',
        category: 'financial_management',
        data: { 
          projectedOverruns: projectedOverruns.map(p => ({
            name: p.name,
            budget: p.budget,
            projectedCost: avgBurnRate * (p.budget || 0) / 100
          }))
        },
        actionable: true,
        timeframe: 'project_completion'
      });
    }

    return insights;
  }

  private analyzeResourceOptimization(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];

    // Analyze team utilization
    const teamUtilization = this.calculateTeamUtilization();
    
    if (teamUtilization.overutilized.length > 0) {
      insights.push({
        id: 'resource-overutilization',
        type: 'risk',
        title: 'Team Overutilization Risk',
        description: `${teamUtilization.overutilized.length} team members are working at >100% capacity, risking burnout.`,
        confidence: 90,
        impact: 'high',
        category: 'resource_management',
        data: teamUtilization,
        actionable: true,
        timeframe: 'next_2_weeks'
      });
    }

    if (teamUtilization.underutilized.length > 0) {
      insights.push({
        id: 'resource-underutilization',
        type: 'opportunity',
        title: 'Resource Optimization Opportunity',
        description: `${teamUtilization.underutilized.length} team members have capacity for additional work.`,
        confidence: 85,
        impact: 'medium',
        category: 'resource_management',
        data: teamUtilization,
        actionable: true,
        timeframe: 'next_2_weeks'
      });
    }

    return insights;
  }

  private analyzeVelocityTrends(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    const velocityTrend = this.calculateVelocityTrend();
    
    if (velocityTrend.trend === 'decreasing' && velocityTrend.confidence > 70) {
      insights.push({
        id: 'velocity-decline',
        type: 'risk',
        title: 'Team Velocity Declining',
        description: `Team velocity has decreased by ${Math.abs(velocityTrend.changePercent)}% over the last 4 weeks.`,
        confidence: velocityTrend.confidence,
        impact: 'medium',
        category: 'team_performance',
        data: velocityTrend,
        actionable: true,
        timeframe: 'last_4_weeks'
      });
    } else if (velocityTrend.trend === 'increasing' && velocityTrend.confidence > 70) {
      insights.push({
        id: 'velocity-improvement',
        type: 'opportunity',
        title: 'Team Velocity Improving',
        description: `Team velocity has increased by ${velocityTrend.changePercent}% - consider taking on additional work.`,
        confidence: velocityTrend.confidence,
        impact: 'medium',
        category: 'team_performance',
        data: velocityTrend,
        actionable: true,
        timeframe: 'last_4_weeks'
      });
    }

    return insights;
  }

  private analyzeQualityMetrics(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    // Analyze task completion patterns for quality indicators
    const qualityMetrics = this.calculateQualityMetrics();
    
    if (qualityMetrics.reworkRate > 15) {
      insights.push({
        id: 'quality-risk',
        type: 'risk',
        title: 'Quality Issues Detected',
        description: `Rework rate of ${qualityMetrics.reworkRate}% indicates potential quality issues.`,
        confidence: 75,
        impact: 'medium',
        category: 'quality_management',
        data: qualityMetrics,
        actionable: true,
        timeframe: 'last_30_days'
      });
    }

    return insights;
  }

  private analyzeCapacityPlanning(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = [];
    
    const capacityForecast = this.forecastCapacityNeeds();
    
    if (capacityForecast.shortfall > 0) {
      insights.push({
        id: 'capacity-shortfall',
        type: 'forecast',
        title: 'Capacity Shortfall Predicted',
        description: `Predicted ${capacityForecast.shortfall}% capacity shortfall in the next quarter.`,
        confidence: capacityForecast.confidence,
        impact: 'high',
        category: 'capacity_planning',
        data: capacityForecast,
        actionable: true,
        timeframe: 'next_quarter'
      });
    }

    return insights;
  }

  // Forecasting methods
  private forecastProjectCompletions(): ForecastResult {
    const activeProjects = this.projects.filter(p => p.status === 'active');
    const avgCompletionRate = this.calculateAverageCompletionRate();
    
    const currentCompletions = this.projects.filter(p => p.status === 'completed').length;
    const predictedCompletions = Math.round(activeProjects.length * avgCompletionRate / 100);

    return {
      metric: 'Project Completions',
      currentValue: currentCompletions,
      predictedValue: currentCompletions + predictedCompletions,
      trend: predictedCompletions > currentCompletions ? 'increasing' : 'stable',
      confidence: 75,
      timeframe: 'next_quarter',
      factors: ['Current velocity', 'Project complexity', 'Team capacity']
    };
  }

  private forecastBudgetUtilization(): ForecastResult | null {
    const projectsWithBudget = this.projects.filter(p => p.budget && p.actualCost);
    if (projectsWithBudget.length === 0) return null;

    const currentUtilization = projectsWithBudget.reduce((sum, p) => 
      sum + ((p.actualCost || 0) / (p.budget || 1))
    , 0) / projectsWithBudget.length * 100;

    const trend = currentUtilization > 80 ? 'increasing' : 
                  currentUtilization < 60 ? 'decreasing' : 'stable';

    return {
      metric: 'Budget Utilization',
      currentValue: Math.round(currentUtilization),
      predictedValue: Math.round(currentUtilization * 1.15), // Projected increase
      trend,
      confidence: 68,
      timeframe: 'project_completion',
      factors: ['Burn rate', 'Scope changes', 'Resource costs']
    };
  }

  private forecastTeamVelocity(): ForecastResult {
    const velocityData = this.calculateHistoricalVelocity();
    const trend = velocityData.length > 1 ? 
      (velocityData[velocityData.length - 1] > velocityData[0] ? 'increasing' : 'decreasing') : 'stable';

    const currentVelocity = velocityData.length > 0 ? velocityData[velocityData.length - 1] : 0;
    const predictedVelocity = this.predictNextVelocity(velocityData);

    return {
      metric: 'Team Velocity',
      currentValue: Math.round(currentVelocity),
      predictedValue: Math.round(predictedVelocity),
      trend,
      confidence: 72,
      timeframe: 'next_sprint',
      factors: ['Historical performance', 'Team changes', 'Project complexity']
    };
  }

  private forecastResourceDemand(): ForecastResult {
    const currentDemand = this.calculateCurrentResourceDemand();
    const seasonalMultiplier = this.getSeasonalMultiplier();
    const predictedDemand = currentDemand * seasonalMultiplier;

    return {
      metric: 'Resource Demand',
      currentValue: Math.round(currentDemand),
      predictedValue: Math.round(predictedDemand),
      trend: predictedDemand > currentDemand ? 'increasing' : 'decreasing',
      confidence: 65,
      timeframe: 'next_month',
      factors: ['Seasonal patterns', 'Project pipeline', 'Team availability']
    };
  }

  private forecastRiskProbability(): ForecastResult {
    const riskFactors = this.calculateRiskFactors();
    const currentRisk = riskFactors.overallRisk;
    const trendMultiplier = riskFactors.trendMultiplier;
    const predictedRisk = Math.min(currentRisk * trendMultiplier, 100);

    return {
      metric: 'Risk Probability',
      currentValue: Math.round(currentRisk),
      predictedValue: Math.round(predictedRisk),
      trend: predictedRisk > currentRisk ? 'increasing' : 'decreasing',
      confidence: 70,
      timeframe: 'next_30_days',
      factors: ['Schedule pressure', 'Budget constraints', 'Team capacity']
    };
  }

  // Helper calculation methods
  private calculateExpectedProgress(project: ProjectData): number {
    const startDate = new Date(project.startDate);
    const dueDate = new Date(project.dueDate);
    const now = new Date();
    
    const totalDuration = dueDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  }

  private analyzeScopeCreepRisk(): PredictiveInsight {
    // Mock scope creep analysis
    const projectsWithScopeChanges = this.projects.filter(p => 
      p.tasks.length > 10 && p.progress < 50 // Heuristic for scope creep
    ).length;

    const scopeCreepRate = (projectsWithScopeChanges / this.projects.length) * 100;

    return {
      id: 'scope-creep-risk',
      type: 'risk',
      title: 'Scope Creep Risk',
      description: `${scopeCreepRate.toFixed(1)}% of projects show signs of scope creep.`,
      confidence: Math.min(90, scopeCreepRate * 2),
      impact: scopeCreepRate > 30 ? 'high' : 'medium',
      category: 'scope_management',
      data: { scopeCreepRate, affectedProjects: projectsWithScopeChanges },
      actionable: true,
      timeframe: 'ongoing'
    };
  }

  private calculateTeamUtilization() {
    // Mock team utilization calculation
    return {
      overutilized: ['Team Member 1', 'Team Member 2'],
      underutilized: ['Team Member 3'],
      optimal: ['Team Member 4', 'Team Member 5'],
      averageUtilization: 85
    };
  }

  private calculateVelocityTrend() {
    // Mock velocity trend calculation
    const velocityData = [80, 85, 82, 78, 75]; // Last 5 sprints
    const recentAvg = velocityData.slice(-2).reduce((a, b) => a + b) / 2;
    const previousAvg = velocityData.slice(0, 3).reduce((a, b) => a + b) / 3;
    
    const changePercent = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      trend: changePercent < -5 ? 'decreasing' as const : 
             changePercent > 5 ? 'increasing' as const : 'stable' as const,
      changePercent: Math.abs(changePercent),
      confidence: 80,
      velocityData
    };
  }

  private calculateQualityMetrics() {
    // Mock quality metrics
    return {
      reworkRate: 12,
      defectRate: 3.5,
      customerSatisfaction: 4.2
    };
  }

  private forecastCapacityNeeds() {
    // Mock capacity forecasting
    return {
      currentCapacity: 100,
      predictedNeed: 125,
      shortfall: 25,
      confidence: 75
    };
  }

  private calculateAverageCompletionRate(): number {
    const completedProjects = this.projects.filter(p => p.status === 'completed');
    return completedProjects.length > 0 ? 
      (completedProjects.length / this.projects.length) * 100 : 0;
  }

  private calculateHistoricalVelocity(): number[] {
    // Mock historical velocity data
    return [75, 80, 78, 82, 85, 83, 87, 90];
  }

  private predictNextVelocity(velocityData: number[]): number {
    if (velocityData.length < 2) return velocityData[0] || 0;
    
    // Simple linear regression prediction
    const n = velocityData.length;
    const sumX = velocityData.reduce((sum, _, i) => sum + i, 0);
    const sumY = velocityData.reduce((sum, val) => sum + val, 0);
    const sumXY = velocityData.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = velocityData.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept;
  }

  private calculateCurrentResourceDemand(): number {
    return this.projects.filter(p => p.status === 'active').length * 10; // Mock calculation
  }

  private getSeasonalMultiplier(): number {
    // Mock seasonal adjustment
    const month = new Date().getMonth();
    return month >= 10 || month <= 1 ? 1.2 : 1.0; // Higher demand in Q4/Q1
  }

  private calculateRiskFactors() {
    const overdueProjects = this.projects.filter(p => 
      new Date(p.dueDate) < new Date() && p.status !== 'completed'
    ).length;
    
    const overBudgetProjects = this.projects.filter(p => 
      p.budget && p.actualCost && p.actualCost > p.budget
    ).length;
    
    const overallRisk = Math.min(100, (overdueProjects + overBudgetProjects) / this.projects.length * 100);
    
    return {
      overallRisk,
      trendMultiplier: 1.1, // Slight increase trend
      factors: {
        scheduleRisk: (overdueProjects / this.projects.length) * 100,
        budgetRisk: (overBudgetProjects / this.projects.length) * 100
      }
    };
  }
}