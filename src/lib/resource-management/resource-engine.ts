export interface Resource {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  skills: Skill[];
  availability: Availability;
  capacity: Capacity;
  workload: WorkloadItem[];
  performanceMetrics: PerformanceMetrics;
  cost: ResourceCost;
  status: 'active' | 'inactive' | 'on_leave' | 'contract_ending';
  location: ResourceLocation;
  preferences: ResourcePreferences;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  level: number; // 1-10 scale
  certifications: string[];
  experience: number; // years
  lastUsed: string;
  verified: boolean;
}

export interface Availability {
  hoursPerWeek: number;
  timeZone: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  vacations: {
    start: string;
    end: string;
    type: 'vacation' | 'sick' | 'training' | 'other';
  }[];
  holidays: string[];
}

export interface Capacity {
  current: number; // percentage
  optimal: number; // percentage
  maximum: number; // percentage
  burnoutRisk: number; // 0-100 scale
  utilization: UtilizationData[];
}

export interface WorkloadItem {
  projectId: string;
  projectName: string;
  taskId?: string;
  taskName?: string;
  allocation: number; // percentage
  startDate: string;
  endDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'planned' | 'active' | 'completed' | 'on_hold';
}

export interface PerformanceMetrics {
  productivity: number; // 0-100 scale
  quality: number; // 0-100 scale
  velocity: number; // story points per sprint
  satisfaction: number; // 0-10 scale
  collaboration: number; // 0-100 scale
  trends: {
    period: string;
    productivity: number;
    quality: number;
    velocity: number;
  }[];
}

export interface ResourceCost {
  hourlyRate: number;
  currency: string;
  totalCost: number;
  budgetAllocated: number;
  budgetRemaining: number;
}

export interface ResourceLocation {
  office: string;
  remote: boolean;
  timeZone: string;
  country: string;
  city: string;
}

export interface ResourcePreferences {
  preferredProjects: string[];
  avoidedProjects: string[];
  preferredSkills: string[];
  careerGoals: string[];
  workStyle: 'individual' | 'collaborative' | 'mixed';
}

export interface UtilizationData {
  week: string;
  planned: number;
  actual: number;
  efficiency: number;
}

export interface ResourceAllocation {
  resourceId: string;
  projectId: string;
  allocation: number;
  startDate: string;
  endDate: string;
  requiredSkills: string[];
  confidence: number;
}

export interface ResourceGap {
  skill: string;
  requiredLevel: number;
  currentLevel: number;
  gap: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  suggestedActions: string[];
}

export interface ResourceOptimization {
  type: 'reallocation' | 'skill_development' | 'hiring' | 'contract';
  description: string;
  impact: number;
  effort: number;
  timeline: string;
  cost: number;
  confidence: number;
}

export class ResourceManagementEngine {
  private resources: Resource[] = [];
  private projects: any[] = [];
  private tasks: any[] = [];

  constructor(resources: Resource[] = [], projects: any[] = [], tasks: any[] = []) {
    this.resources = resources;
    this.projects = projects;
    this.tasks = tasks;
  }

  updateData(resources: Resource[], projects: any[] = [], tasks: any[] = []) {
    this.resources = resources;
    this.projects = projects;
    this.tasks = tasks;
  }

  // Resource Analysis
  analyzeResourceUtilization(): {
    overall: number;
    byDepartment: Record<string, number>;
    byRole: Record<string, number>;
    overutilized: Resource[];
    underutilized: Resource[];
    optimal: Resource[];
  } {
    const overall = this.resources.reduce((sum, resource) => 
      sum + resource.capacity.current, 0) / this.resources.length;

    const byDepartment = this.resources.reduce((acc, resource) => {
      acc[resource.department] = (acc[resource.department] || 0) + resource.capacity.current;
      return acc;
    }, {} as Record<string, number>);

    const byRole = this.resources.reduce((acc, resource) => {
      acc[resource.role] = (acc[resource.role] || 0) + resource.capacity.current;
      return acc;
    }, {} as Record<string, number>);

    // Normalize department and role averages
    Object.keys(byDepartment).forEach(dept => {
      const count = this.resources.filter(r => r.department === dept).length;
      byDepartment[dept] = byDepartment[dept] / count;
    });

    Object.keys(byRole).forEach(role => {
      const count = this.resources.filter(r => r.role === role).length;
      byRole[role] = byRole[role] / count;
    });

    const overutilized = this.resources.filter(r => r.capacity.current > 100);
    const underutilized = this.resources.filter(r => r.capacity.current < 70);
    const optimal = this.resources.filter(r => r.capacity.current >= 70 && r.capacity.current <= 100);

    return {
      overall,
      byDepartment,
      byRole,
      overutilized,
      underutilized,
      optimal
    };
  }

  analyzeSkillGaps(): ResourceGap[] {
    const skillRequirements = this.calculateSkillRequirements();
    const availableSkills = this.calculateAvailableSkills();
    const gaps: ResourceGap[] = [];

    Object.entries(skillRequirements).forEach(([skill, required]) => {
      const available = availableSkills[skill] || 0;
      if (available < required.level) {
        gaps.push({
          skill,
          requiredLevel: required.level,
          currentLevel: available,
          gap: required.level - available,
          urgency: this.determineUrgency(required.level - available, required.deadline),
          suggestedActions: this.generateSkillGapActions(skill, required.level - available)
        });
      }
    });

    return gaps.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  optimizeResourceAllocation(projectId: string, requiredSkills: string[]): ResourceAllocation[] {
    const availableResources = this.resources.filter(r => 
      r.status === 'active' && r.capacity.current < 100
    );

    const allocations: ResourceAllocation[] = [];

    requiredSkills.forEach(skill => {
      const suitableResources = availableResources
        .filter(resource => resource.skills.some(s => s.name === skill))
        .sort((a, b) => {
          const aSkill = a.skills.find(s => s.name === skill);
          const bSkill = b.skills.find(s => s.name === skill);
          return (bSkill?.level || 0) - (aSkill?.level || 0);
        });

      if (suitableResources.length > 0) {
        const bestResource = suitableResources[0];
        const skillLevel = bestResource.skills.find(s => s.name === skill)?.level || 0;
        const availableCapacity = 100 - bestResource.capacity.current;
        
        allocations.push({
          resourceId: bestResource.id,
          projectId,
          allocation: Math.min(availableCapacity, 50), // Max 50% allocation
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          requiredSkills: [skill],
          confidence: this.calculateAllocationConfidence(bestResource, skill, skillLevel)
        });
      }
    });

    return allocations;
  }

  generateOptimizationRecommendations(): ResourceOptimization[] {
    const recommendations: ResourceOptimization[] = [];

    // Analyze current state
    const utilization = this.analyzeResourceUtilization();
    const skillGaps = this.analyzeSkillGaps();

    // Reallocation recommendations
    if (utilization.overutilized.length > 0 && utilization.underutilized.length > 0) {
      recommendations.push({
        type: 'reallocation',
        description: `Reallocate ${utilization.overutilized.length} overloaded resources to balance workload`,
        impact: 85,
        effort: 60,
        timeline: '2-3 weeks',
        cost: 0,
        confidence: 80
      });
    }

    // Skill development recommendations
    const criticalSkillGaps = skillGaps.filter(gap => gap.urgency === 'critical' || gap.urgency === 'high');
    if (criticalSkillGaps.length > 0) {
      recommendations.push({
        type: 'skill_development',
        description: `Address ${criticalSkillGaps.length} critical skill gaps through training programs`,
        impact: 90,
        effort: 80,
        timeline: '3-6 months',
        cost: 25000,
        confidence: 75
      });
    }

    // Hiring recommendations
    const severeGaps = skillGaps.filter(gap => gap.gap > 5);
    if (severeGaps.length > 0) {
      recommendations.push({
        type: 'hiring',
        description: `Hire ${Math.ceil(severeGaps.length / 3)} specialists for critical skill areas`,
        impact: 95,
        effort: 90,
        timeline: '3-4 months',
        cost: 150000,
        confidence: 70
      });
    }

    // Contract recommendations
    const urgentGaps = skillGaps.filter(gap => gap.urgency === 'critical');
    if (urgentGaps.length > 0) {
      recommendations.push({
        type: 'contract',
        description: `Engage contractors for ${urgentGaps.length} urgent skill requirements`,
        impact: 80,
        effort: 40,
        timeline: '2-4 weeks',
        cost: 50000,
        confidence: 85
      });
    }

    return recommendations.sort((a, b) => (b.impact * b.confidence) - (a.impact * a.confidence));
  }

  predictResourceDemand(timeframe: '1m' | '3m' | '6m' | '1y'): {
    demand: Record<string, number>;
    supply: Record<string, number>;
    gap: Record<string, number>;
    confidence: number;
  } {
    const months = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 }[timeframe];
    
    // Mock prediction based on historical trends and planned projects
    const demand = this.calculateFutureDemand(months);
    const supply = this.calculateFutureSupply(months);
    const gap: Record<string, number> = {};

    Object.keys(demand).forEach(skill => {
      gap[skill] = demand[skill] - (supply[skill] || 0);
    });

    return {
      demand,
      supply,
      gap,
      confidence: Math.max(95 - months * 5, 60) // Confidence decreases with longer timeframes
    };
  }

  calculateTeamCompatibility(resourceIds: string[]): {
    score: number;
    factors: {
      skillComplementarity: number;
      workStyleAlignment: number;
      collaborationHistory: number;
      timeZoneOverlap: number;
    };
    recommendations: string[];
  } {
    const team = this.resources.filter(r => resourceIds.includes(r.id));
    
    const skillComplementarity = this.calculateSkillComplementarity(team);
    const workStyleAlignment = this.calculateWorkStyleAlignment(team);
    const collaborationHistory = this.calculateCollaborationHistory(team);
    const timeZoneOverlap = this.calculateTimeZoneOverlap(team);

    const score = (skillComplementarity + workStyleAlignment + collaborationHistory + timeZoneOverlap) / 4;

    const recommendations: string[] = [];
    if (skillComplementarity < 70) recommendations.push('Consider adding resources with complementary skills');
    if (workStyleAlignment < 60) recommendations.push('Team members have different work styles - may need coordination');
    if (timeZoneOverlap < 50) recommendations.push('Limited timezone overlap - plan async collaboration');

    return {
      score,
      factors: {
        skillComplementarity,
        workStyleAlignment,
        collaborationHistory,
        timeZoneOverlap
      },
      recommendations
    };
  }

  // Helper methods
  private calculateSkillRequirements(): Record<string, { level: number; deadline: string }> {
    // Mock calculation based on active projects
    return {
      'React': { level: 8, deadline: '2024-12-31' },
      'Node.js': { level: 7, deadline: '2024-11-30' },
      'Python': { level: 6, deadline: '2025-01-31' },
      'DevOps': { level: 8, deadline: '2024-10-31' },
      'UI/UX Design': { level: 7, deadline: '2024-12-15' }
    };
  }

  private calculateAvailableSkills(): Record<string, number> {
    const skillLevels: Record<string, number[]> = {};
    
    this.resources.forEach(resource => {
      resource.skills.forEach(skill => {
        if (!skillLevels[skill.name]) skillLevels[skill.name] = [];
        skillLevels[skill.name].push(skill.level);
      });
    });

    const availableSkills: Record<string, number> = {};
    Object.entries(skillLevels).forEach(([skill, levels]) => {
      availableSkills[skill] = Math.max(...levels);
    });

    return availableSkills;
  }

  private determineUrgency(gap: number, deadline: string): 'critical' | 'high' | 'medium' | 'low' {
    const daysUntilDeadline = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (gap > 5 && daysUntilDeadline < 30) return 'critical';
    if (gap > 3 && daysUntilDeadline < 60) return 'high';
    if (gap > 2 && daysUntilDeadline < 90) return 'medium';
    return 'low';
  }

  private generateSkillGapActions(skill: string, gap: number): string[] {
    const actions: string[] = [];
    
    if (gap <= 2) {
      actions.push('Internal training program');
      actions.push('Mentoring by senior team members');
    } else if (gap <= 4) {
      actions.push('External training course');
      actions.push('Certification program');
      actions.push('Part-time contractor support');
    } else {
      actions.push('Hire experienced specialist');
      actions.push('Engage consulting firm');
      actions.push('Long-term contractor');
    }

    return actions;
  }

  private calculateAllocationConfidence(resource: Resource, skill: string, skillLevel: number): number {
    let confidence = 70; // Base confidence

    // Skill level factor
    confidence += Math.min(skillLevel * 3, 20);

    // Performance factor
    confidence += (resource.performanceMetrics.productivity - 70) * 0.3;

    // Availability factor
    const availableCapacity = 100 - resource.capacity.current;
    confidence += Math.min(availableCapacity * 0.2, 10);

    return Math.max(Math.min(confidence, 95), 30);
  }

  private calculateFutureDemand(months: number): Record<string, number> {
    // Mock future demand calculation
    const baseDemand = {
      'React': 10,
      'Node.js': 8,
      'Python': 6,
      'DevOps': 5,
      'UI/UX Design': 4
    };

    // Increase demand based on growth projections
    const growthRate = 1 + (months * 0.05); // 5% growth per month
    const futureDemand: Record<string, number> = {};

    Object.entries(baseDemand).forEach(([skill, demand]) => {
      futureDemand[skill] = Math.round(demand * growthRate);
    });

    return futureDemand;
  }

  private calculateFutureSupply(months: number): Record<string, number> {
    // Mock future supply calculation based on current resources and training
    const currentSupply = this.calculateAvailableSkills();
    const futureSupply: Record<string, number> = {};

    Object.entries(currentSupply).forEach(([skill, supply]) => {
      // Assume skill improvement over time
      const improvementRate = 1 + (months * 0.02); // 2% improvement per month
      futureSupply[skill] = Math.round(supply * improvementRate);
    });

    return futureSupply;
  }

  private calculateSkillComplementarity(team: Resource[]): number {
    // Mock calculation - measure how well skills complement each other
    const allSkills = new Set();
    team.forEach(resource => {
      resource.skills.forEach(skill => allSkills.add(skill.name));
    });

    const skillCoverage = allSkills.size / 20; // Assume 20 ideal skills
    return Math.min(skillCoverage * 100, 100);
  }

  private calculateWorkStyleAlignment(team: Resource[]): number {
    // Mock calculation - measure work style compatibility
    const styles = team.map(r => r.preferences.workStyle);
    const uniqueStyles = new Set(styles);
    
    if (uniqueStyles.size === 1) return 100; // All same style
    if (uniqueStyles.size === 2) return 75;  // Two styles
    return 50; // All different styles
  }

  private calculateCollaborationHistory(team: Resource[]): number {
    // Mock calculation - measure previous collaboration success
    return 75; // Default score
  }

  private calculateTimeZoneOverlap(team: Resource[]): number {
    // Mock calculation - measure timezone overlap
    const timeZones = team.map(r => r.location.timeZone);
    const uniqueTimeZones = new Set(timeZones);
    
    if (uniqueTimeZones.size === 1) return 100; // Same timezone
    if (uniqueTimeZones.size <= 3) return 70;   // Close timezones
    return 40; // Distributed team
  }
}