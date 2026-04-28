import type {
  ActionPlanData,
  ActionPlanTask,
  BlueprintData,
  DeepAnalysisData,
  Project,
  TechStackData,
  ValidationData,
} from '../types';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asRecord = (value: unknown): UnknownRecord => (isRecord(value) ? value : {});

const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? value as T[] : []);

const asOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const asNumber = (value: unknown, fallback = 0): number => asOptionalNumber(value) ?? fallback;

const asString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const asBoolean = (value: unknown, fallback = false): boolean =>
  typeof value === 'boolean' ? value : fallback;

const asStringArray = (value: unknown): string[] =>
  asArray(value)
    .map((item) => asString(item).trim())
    .filter(Boolean);

const normalizeDiagramType = (value: unknown): BlueprintData['diagrams'][number]['type'] => {
  const type = asString(value);
  return type === 'database' || type === 'flow' ? type : 'system';
};

const normalizeCategory = (value: unknown): ActionPlanTask['category'] => {
  const category = asString(value);
  if (
    category === 'Research' ||
    category === 'Development' ||
    category === 'Marketing' ||
    category === 'Design' ||
    category === 'Testing' ||
    category === 'Launch'
  ) {
    return category;
  }
  return 'Development';
};

const normalizeRoadmapColumn = (value: unknown): string => {
  const column = asString(value);
  return ['Backlog', 'To Do', 'In Progress', 'Review', 'Done'].includes(column) ? column : 'Backlog';
};

const normalizeRoadmapTag = (value: unknown): 'Frontend' | 'Backend' | 'Design' | 'Marketing' => {
  const tag = asString(value);
  if (tag === 'Frontend' || tag === 'Backend' || tag === 'Design' || tag === 'Marketing') {
    return tag;
  }
  return 'Frontend';
};

export const normalizeValidationData = (raw: unknown): ValidationData => {
  const source = asRecord(raw);
  const marketStats = asRecord(source.marketStats);
  const swot = asRecord(source.swot);

  return {
    projectTitle: asString(source.projectTitle, 'Untitled Project'),
    viabilityScore: asNumber(source.viabilityScore),
    summary: asString(source.summary),
    radarData: asArray(source.radarData).map((item) => {
      const row = asRecord(item);
      return {
        subject: asString(row.subject),
        A: asNumber(row.A),
        fullMark: asNumber(row.fullMark, 100),
      };
    }),
    revenueData: asArray(source.revenueData).map((item) => {
      const row = asRecord(item);
      return {
        year: asString(row.year),
        revenue: asNumber(row.revenue),
        expenses: asNumber(row.expenses),
      };
    }),
    marketStats: {
      tam: asNumber(marketStats.tam),
      sam: asNumber(marketStats.sam),
      som: asNumber(marketStats.som),
    },
    swot: {
      strengths: asStringArray(swot.strengths),
      weaknesses: asStringArray(swot.weaknesses),
      opportunities: asStringArray(swot.opportunities),
      threats: asStringArray(swot.threats),
    },
    competitors: asArray(source.competitors).map((item) => {
      const competitor = asRecord(item);
      return {
        name: asString(competitor.name, 'Competitor'),
        price: asString(competitor.price),
        gap: asString(competitor.gap),
        url: competitor.url ? asString(competitor.url) : undefined,
      };
    }),
  };
};

export const normalizeDeepAnalysisData = (raw: unknown): DeepAnalysisData => {
  const source = asRecord(raw);
  const marketDemand = asRecord(source.marketDemand);
  const competitorAnalysis = asRecord(source.competitorAnalysis);
  const competitorNames = asRecord(competitorAnalysis.competitorNames);
  const feasibility = asRecord(source.feasibility);
  const monetization = asRecord(source.monetization);

  return {
    marketDemand: {
      trendData: asArray(marketDemand.trendData).map((item) => {
        const row = asRecord(item);
        return {
          month: asString(row.month),
          searchVolume: asNumber(row.searchVolume),
          interest: asNumber(row.interest),
        };
      }),
      keywords: asArray(marketDemand.keywords).map((item) => {
        const row = asRecord(item);
        return {
          text: asString(row.text),
          value: asNumber(row.value),
        };
      }),
      audienceSegments: asArray(marketDemand.audienceSegments).map((item) => {
        const segment = asRecord(item);
        return {
          segment: asString(segment.segment, 'Audience Segment'),
          size: asString(segment.size),
          painPoint: asString(segment.painPoint),
        };
      }),
    },
    competitorAnalysis: {
      featureMatrix: asArray(competitorAnalysis.featureMatrix).map((item) => {
        const row = asRecord(item);
        return {
          feature: asString(row.feature),
          us: asBoolean(row.us),
          competitorA: asBoolean(row.competitorA),
          competitorB: asBoolean(row.competitorB),
        };
      }),
      competitorNames: {
        A: asString(competitorNames.A, 'Competitor A'),
        B: asString(competitorNames.B, 'Competitor B'),
      },
    },
    feasibility: {
      technicalDifficulty: asNumber(feasibility.technicalDifficulty),
      devTimeMonths: asNumber(feasibility.devTimeMonths),
      infraCost: asNumber(feasibility.infraCost),
      costBreakdown: asArray(feasibility.costBreakdown).map((item) => {
        const row = asRecord(item);
        return {
          item: asString(row.item),
          cost: asNumber(row.cost),
        };
      }),
      risks: asArray(feasibility.risks).map((item) => {
        const risk = asRecord(item);
        const severity = asString(risk.severity);
        return {
          risk: asString(risk.risk),
          severity: severity === 'Low' || severity === 'High' ? severity : 'Medium',
          mitigation: asString(risk.mitigation),
        };
      }),
    },
    monetization: {
      strategy: asString(monetization.strategy),
      tiers: asArray(monetization.tiers).map((item) => {
        const tier = asRecord(item);
        return {
          name: asString(tier.name, 'Plan'),
          price: asString(tier.price),
          features: asStringArray(tier.features),
          highlight: asBoolean(tier.highlight),
        };
      }),
      projectedMRR: asArray(monetization.projectedMRR).map((item) => {
        const row = asRecord(item);
        return {
          month: asString(row.month),
          amount: asNumber(row.amount),
        };
      }),
    },
  };
};

export const normalizeBlueprintData = (raw: unknown): BlueprintData => {
  const source = asRecord(raw);

  return {
    diagrams: asArray(source.diagrams).map((item, diagramIndex) => {
      const diagram = asRecord(item);
      const type = normalizeDiagramType(diagram.type);
      const nodeType = type === 'database' ? 'databaseNode' : type === 'flow' ? 'flowNode' : 'systemNode';
      const edges = asArray(diagram.edges)
        .map((edgeItem, edgeIndex) => {
          const edge = asRecord(edgeItem);
          return {
            id: asString(edge.id, `edge-${diagramIndex}-${edgeIndex}`),
            source: asString(edge.source),
            target: asString(edge.target),
            label: asString(edge.label),
          };
        })
        .filter((edge) => edge.source && edge.target) as BlueprintData['diagrams'][number]['edges'];

      return {
        id: asString(diagram.id, `diag-${diagramIndex}`),
        title: asString(diagram.title, `Diagram ${diagramIndex + 1}`),
        type,
        description: asString(diagram.description),
        edges,
        nodes: asArray(diagram.nodes).map((nodeItem, nodeIndex) => {
          const node = asRecord(nodeItem);
          return {
            id: asString(node.id, `node-${diagramIndex}-${nodeIndex}`),
            type: nodeType,
            position: {
              x: asNumber(node.x, nodeIndex * 180),
              y: asNumber(node.y, nodeIndex * 120),
            },
            data: {
              label: asString(node.label, `Node ${nodeIndex + 1}`),
              iconType: asString(node.type, type),
              attributes: asStringArray(node.attributes),
            },
          };
        }),
      };
    }),
  };
};

export const normalizeActionPlanData = (raw: unknown): ActionPlanData => {
  const source = asRecord(raw);
  const phases = asArray(source.phases).map((item, phaseIndex) => {
    const phase = asRecord(item);
    const tasks = asArray(phase.tasks).map((taskItem, taskIndex) => {
      const task = asRecord(taskItem);
      return {
        day: asNumber(task.day, phaseIndex * 7 + taskIndex + 1),
        title: asString(task.title, 'Untitled task'),
        description: asString(task.description),
        estimatedTime: asString(task.estimatedTime),
        category: normalizeCategory(task.category),
      };
    });

    return {
      id: asString(phase.id, `phase-${phaseIndex}`),
      name: asString(phase.name, `Phase ${phaseIndex + 1}`),
      description: asString(phase.description),
      startDay: asNumber(phase.startDay, phaseIndex * 7 + 1),
      endDay: asNumber(phase.endDay, phaseIndex * 7 + 7),
      tasks,
    };
  });

  const derivedTaskCount = phases.reduce((total, phase) => total + phase.tasks.length, 0);

  return {
    phases,
    totalTasks: asOptionalNumber(source.totalTasks) ?? derivedTaskCount,
    estimatedTotalHours: asNumber(source.estimatedTotalHours),
  };
};

export const normalizeTechStackData = (raw: unknown): TechStackData => {
  const source = asRecord(raw);
  const diagram = asRecord(source.diagram);
  const hasDiagram = Object.keys(diagram).length > 0;

  return {
    technologies: asArray(source.technologies).map((item) => {
      const tech = asRecord(item);
      return {
        name: asString(tech.name, 'Technology'),
        category: asString(tech.category),
        icon: asString(tech.icon),
        docs: asString(tech.docs),
        description: asString(tech.description),
        color: asString(tech.color, '#71717a'),
      };
    }),
    auditReport: asString(source.auditReport),
    diagram: hasDiagram ? {
      nodes: asArray(diagram.nodes).map((item, index) => {
        const node = asRecord(item);
        return {
          id: asString(node.id, `stack-node-${index}`),
          label: asString(node.label, `Node ${index + 1}`),
          type: asString(node.type),
        };
      }),
      edges: asArray(diagram.edges)
        .map((item, index) => {
          const edge = asRecord(item);
          return {
            id: asString(edge.id, `stack-edge-${index}`),
            source: asString(edge.source),
            target: asString(edge.target),
          };
        })
        .filter((edge) => edge.source && edge.target),
    } : undefined,
  };
};

export const normalizeRoadmapTasks = (raw: unknown) => {
  const source = asRecord(raw);
  return asArray(source.tasks).map((item) => {
    const task = asRecord(item);
    return {
      title: asString(task.title, 'Untitled task'),
      column: normalizeRoadmapColumn(task.column),
      tag: normalizeRoadmapTag(task.tag),
    };
  });
};

export const normalizeProject = (project: Project): Project => {
  const data = (project.data ?? {}) as Project['data'];
  const normalizedData: Project['data'] = { ...data };

  if (data.validation) normalizedData.validation = normalizeValidationData(data.validation);
  if (data.deepAnalysis) normalizedData.deepAnalysis = normalizeDeepAnalysisData(data.deepAnalysis);
  if (data.blueprint) normalizedData.blueprint = normalizeBlueprintData(data.blueprint);
  if (data.actionPlan) normalizedData.actionPlan = normalizeActionPlanData(data.actionPlan);
  if (data.techStack) normalizedData.techStack = normalizeTechStackData(data.techStack);

  return {
    ...project,
    data: normalizedData,
  };
};

export const normalizeProjects = (projects: Project[]): Project[] => projects.map(normalizeProject);
