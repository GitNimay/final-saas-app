
import { Edge, Node } from 'reactflow';

export type User = {
  id: string;
  email: string;
};

export interface UserSettings {
  displayName: string;
  jobTitle: string;
  theme: 'light' | 'dark' | 'system';
  agentPersona: 'nerdy' | 'expert' | 'noob' | 'friendly';
  notifications: boolean;
}

export interface Message {
  id: string;
  project_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  data: {
    validation?: ValidationData;
    blueprint?: BlueprintData;
    roadmap?: KanbanBoard;
    mindMap?: MindMapData;
    techStack?: TechStackData;
    deepAnalysis?: DeepAnalysisData; // New field
    prd?: string;
    builder?: {
      prompt: string;
      answers: Record<string, string>;
    }
  };
}

export interface ValidationData {
  projectTitle: string; // New field for short title
  viabilityScore: number;
  summary: string;
  radarData: { subject: string; A: number; fullMark: number }[];
  revenueData: { year: string; revenue: number; expenses: number }[];
  marketStats: {
    tam: number;
    sam: number;
    som: number;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: { name: string; price: string; gap: string; url?: string }[];
}

// New Data Structures for Deep Insights
export interface DeepAnalysisData {
  marketDemand: {
    trendData: { month: string; searchVolume: number; interest: number }[];
    keywords: { text: string; value: number }[];
    audienceSegments: { segment: string; size: string; painPoint: string }[];
  };
  competitorAnalysis: {
    featureMatrix: {
      feature: string;
      us: boolean;
      competitorA: boolean;
      competitorB: boolean;
    }[];
    competitorNames: { A: string; B: string };
  };
  feasibility: {
    technicalDifficulty: number; // 0-100
    devTimeMonths: number;
    infraCost: number; // Monthly $
    costBreakdown: { item: string; cost: number }[];
    risks: { risk: string; severity: 'Low' | 'Medium' | 'High'; mitigation: string }[];
  };
  monetization: {
    strategy: string;
    tiers: {
      name: string;
      price: string;
      features: string[];
      highlight?: boolean;
    }[];
    projectedMRR: { month: string; amount: number }[];
  };
}

export interface BlueprintDiagram {
  id: string;
  title: string;
  type: 'system' | 'database' | 'flow';
  nodes: Node[];
  edges: Edge[];
  description: string;
}

export interface BlueprintData {
  diagrams: BlueprintDiagram[];
}

export interface KanbanItem {
  id: string;
  content: string;
  tag: 'Frontend' | 'Backend' | 'Design' | 'Marketing';
}

export interface KanbanColumn {
  id: string;
  title: string;
  items: KanbanItem[];
}

export interface KanbanBoard {
  columns: Record<string, KanbanColumn>;
  columnOrder: string[];
}

export interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

export interface TechStackData {
  technologies: {
    name: string;
    category: string;
    icon: string;
    docs: string;
    description: string;
    color: string;
  }[];
  auditReport: string;
  diagram?: {
    nodes: { id: string; label: string; type: string }[];
    edges: { id: string; source: string; target: string }[];
  };
}

export type TabView = 'validation' | 'blueprint' | 'roadmap' | 'mindmap' | 'techstack' | 'prd' | 'builder' | 'deepAnalysis';

export enum LoadingStep {
  IDLE = 'IDLE',
  ANALYZING = 'Analyzing Market Viability...',
  DEEP_DIVING = 'Generating Deep Insights...',
  BLUEPRINTING = 'Architecting System...',
  ROADMAPPING = 'Planning Roadmap...',
  COMPILING = 'Compiling Tech Stack...',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
