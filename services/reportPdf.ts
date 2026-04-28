import type { Project } from '../types';

export type ReportBlockStyle = 'body' | 'subheading' | 'muted';

export interface ReportBlock {
  text: string;
  style?: ReportBlockStyle;
}

export interface ReportSection {
  title: string;
  blocks: ReportBlock[];
  startOnNewPage?: boolean;
}

interface ReportPdfDocument {
  internal: {
    pageSize: {
      width?: number;
      height?: number;
      getWidth?: () => number;
      getHeight?: () => number;
    };
    getNumberOfPages?: () => number;
  };
  addPage: () => unknown;
  setPage?: (pageNumber: number) => unknown;
  setFont: (fontName: string, fontStyle?: string) => unknown;
  setFontSize: (fontSize: number) => unknown;
  setTextColor: (...channels: (string | number)[]) => unknown;
  setDrawColor?: (...channels: (string | number)[]) => unknown;
  setLineWidth?: (width: number) => unknown;
  line?: (x1: number, y1: number, x2: number, y2: number) => unknown;
  text: (text: string | string[], x: number, y: number, options?: unknown) => unknown;
  splitTextToSize: (text: string, maxWidth: number) => string[];
  setProperties?: (properties: Record<string, string>) => unknown;
}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const textOrDash = (value: unknown): string => {
  if (value === null || value === undefined) return 'N/A';
  const text = String(value).trim();
  return text.length > 0 ? text : 'N/A';
};

const formatNumber = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return textOrDash(value);
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
};

const formatCurrency = (value: unknown): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return textOrDash(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const yesNo = (value: boolean): string => (value ? 'Yes' : 'No');

const joinList = (items: string[] | undefined): string => {
  const cleanItems = (items ?? []).map((item) => item.trim()).filter(Boolean);
  return cleanItems.length > 0 ? cleanItems.join('; ') : 'N/A';
};

const markdownToPlainText = (value: string): string =>
  value
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

const addBlock = (blocks: ReportBlock[], text: string | undefined, style: ReportBlockStyle = 'body') => {
  if (hasText(text)) blocks.push({ text: text.trim(), style });
};

const addListBlock = (blocks: ReportBlock[], label: string, items: string[] | undefined) => {
  addBlock(blocks, `${label}: ${joinList(items)}`);
};

const makeSection = (
  title: string,
  blocks: ReportBlock[],
  startOnNewPage = true,
): ReportSection | undefined => (blocks.length > 0 ? { title, blocks, startOnNewPage } : undefined);

const buildOverviewSection = (project: Project): ReportSection => {
  const blocks: ReportBlock[] = [
    { text: `Project Name: ${project.name}`, style: 'subheading' },
    { text: `Description: ${textOrDash(project.description)}` },
  ];

  if (project.created_at) {
    blocks.push({ text: `Created: ${new Date(project.created_at).toLocaleString()}`, style: 'muted' });
  }

  const generatedSections = [
    project.data.validation ? 'Validation' : undefined,
    project.data.deepAnalysis ? 'Deep Insights' : undefined,
    project.data.blueprint ? 'Blueprint' : undefined,
    project.data.roadmap ? 'Roadmap' : undefined,
    project.data.actionPlan ? '30-Day Action Plan' : undefined,
    project.data.techStack ? 'Tech Stack' : undefined,
    project.data.prd ? 'PRD Documents' : undefined,
    project.data.builder ? 'AI Builder' : undefined,
    project.data.mindMap ? 'Mind Map' : undefined,
  ].filter(Boolean);

  if (generatedSections.length > 0) {
    blocks.push({ text: `Included Pages: ${generatedSections.join(', ')}` });
  }

  return { title: 'Project Report', blocks, startOnNewPage: false };
};

const buildValidationSection = (project: Project): ReportSection | undefined => {
  const data = project.data.validation;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  addBlock(blocks, `Project Title: ${textOrDash(data.projectTitle)}`, 'subheading');
  addBlock(blocks, `Viability Score: ${formatNumber(data.viabilityScore)}/100`);
  addBlock(blocks, `Summary: ${textOrDash(data.summary)}`);
  addBlock(
    blocks,
    `Market Stats: TAM ${formatCurrency(data.marketStats?.tam)}; SAM ${formatCurrency(data.marketStats?.sam)}; SOM ${formatCurrency(data.marketStats?.som)}`,
  );
  addBlock(blocks, 'Score Radar', 'subheading');
  data.radarData?.forEach((item) => {
    addBlock(blocks, `${textOrDash(item.subject)}: ${formatNumber(item.A)}/${formatNumber(item.fullMark)}`);
  });
  addBlock(blocks, 'Revenue Forecast', 'subheading');
  data.revenueData?.forEach((item) => {
    addBlock(
      blocks,
      `${textOrDash(item.year)}: Revenue ${formatCurrency(item.revenue)}; Expenses ${formatCurrency(item.expenses)}`,
    );
  });
  addBlock(blocks, 'SWOT', 'subheading');
  addListBlock(blocks, 'Strengths', data.swot?.strengths);
  addListBlock(blocks, 'Weaknesses', data.swot?.weaknesses);
  addListBlock(blocks, 'Opportunities', data.swot?.opportunities);
  addListBlock(blocks, 'Threats', data.swot?.threats);
  addBlock(blocks, 'Competitors', 'subheading');
  data.competitors?.forEach((competitor) => {
    addBlock(
      blocks,
      `${textOrDash(competitor.name)}: Price ${textOrDash(competitor.price)}; Gap ${textOrDash(competitor.gap)}${competitor.url ? `; URL ${competitor.url}` : ''}`,
    );
  });

  return makeSection('Validation & Market Analysis', blocks);
};

const buildDeepAnalysisSection = (project: Project): ReportSection | undefined => {
  const data = project.data.deepAnalysis;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  addBlock(blocks, 'Market Demand', 'subheading');
  data.marketDemand?.trendData?.forEach((item) => {
    addBlock(
      blocks,
      `${textOrDash(item.month)}: Interest ${formatNumber(item.interest)}; Search Volume ${formatNumber(item.searchVolume)}`,
    );
  });
  data.marketDemand?.keywords?.forEach((item) => {
    addBlock(blocks, `${textOrDash(item.text)}: ${formatNumber(item.value)}`);
  });
  data.marketDemand?.audienceSegments?.forEach((segment) => {
    addBlock(
      blocks,
      `${textOrDash(segment.segment)}: Size ${textOrDash(segment.size)}; Pain Point ${textOrDash(segment.painPoint)}`,
    );
  });

  addBlock(blocks, 'Competitor Feature Matrix', 'subheading');
  const competitorA = data.competitorAnalysis?.competitorNames?.A || 'Competitor A';
  const competitorB = data.competitorAnalysis?.competitorNames?.B || 'Competitor B';
  data.competitorAnalysis?.featureMatrix?.forEach((feature) => {
    addBlock(
      blocks,
      `${textOrDash(feature.feature)}: Us ${yesNo(feature.us)}; ${competitorA} ${yesNo(feature.competitorA)}; ${competitorB} ${yesNo(feature.competitorB)}`,
    );
  });

  addBlock(blocks, 'Feasibility', 'subheading');
  addBlock(
    blocks,
    `Technical Difficulty: ${formatNumber(data.feasibility?.technicalDifficulty)}/100; Development Time: ${formatNumber(data.feasibility?.devTimeMonths)} months; Infrastructure Cost: ${formatCurrency(data.feasibility?.infraCost)}/month`,
  );
  data.feasibility?.costBreakdown?.forEach((item) => {
    addBlock(blocks, `${textOrDash(item.item)}: ${formatCurrency(item.cost)}`);
  });
  data.feasibility?.risks?.forEach((risk) => {
    addBlock(
      blocks,
      `${textOrDash(risk.risk)}: Severity ${textOrDash(risk.severity)}; Mitigation ${textOrDash(risk.mitigation)}`,
    );
  });

  addBlock(blocks, 'Monetization', 'subheading');
  addBlock(blocks, `Strategy: ${textOrDash(data.monetization?.strategy)}`);
  data.monetization?.tiers?.forEach((tier) => {
    addBlock(blocks, `${textOrDash(tier.name)} (${textOrDash(tier.price)}): ${joinList(tier.features)}`);
  });
  data.monetization?.projectedMRR?.forEach((item) => {
    addBlock(blocks, `${textOrDash(item.month)}: ${formatCurrency(item.amount)}`);
  });

  return makeSection('Deep Insights', blocks);
};

const buildBlueprintSection = (project: Project): ReportSection | undefined => {
  const data = project.data.blueprint;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  data.diagrams?.forEach((diagram) => {
    addBlock(blocks, `${textOrDash(diagram.title)} (${textOrDash(diagram.type)})`, 'subheading');
    addBlock(blocks, `Description: ${textOrDash(diagram.description)}`);
    diagram.nodes?.forEach((node) => {
      const label = textOrDash(node.data?.label ?? node.id);
      const attributes = Array.isArray(node.data?.attributes) ? node.data.attributes : [];
      addBlock(blocks, `Node ${textOrDash(node.id)}: ${label}${attributes.length ? `; Attributes ${joinList(attributes)}` : ''}`);
    });
    diagram.edges?.forEach((edge) => {
      addBlock(
        blocks,
        `${textOrDash(edge.source)} -> ${textOrDash(edge.target)}${edge.label ? ` (${edge.label})` : ''}`,
      );
    });
  });

  return makeSection('Blueprint', blocks);
};

const buildRoadmapSection = (project: Project): ReportSection | undefined => {
  const data = project.data.roadmap;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  const columnIds = data.columnOrder?.length ? data.columnOrder : Object.keys(data.columns ?? {});
  columnIds.forEach((columnId) => {
    const column = data.columns?.[columnId];
    if (!column) return;
    addBlock(blocks, textOrDash(column.title), 'subheading');
    column.items?.forEach((item) => {
      addBlock(blocks, `${textOrDash(item.content)} (${textOrDash(item.tag)})`);
    });
  });

  return makeSection('Roadmap', blocks);
};

const buildActionPlanSection = (project: Project): ReportSection | undefined => {
  const data = project.data.actionPlan;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  addBlock(blocks, `Total Tasks: ${formatNumber(data.totalTasks)}`);
  addBlock(blocks, `Estimated Total Hours: ${formatNumber(data.estimatedTotalHours)}`);
  data.phases?.forEach((phase) => {
    addBlock(
      blocks,
      `${textOrDash(phase.name)} (Days ${formatNumber(phase.startDay)}-${formatNumber(phase.endDay)}): ${textOrDash(phase.description)}`,
      'subheading',
    );
    phase.tasks?.forEach((task) => {
      addBlock(
        blocks,
        `Day ${formatNumber(task.day)} - ${textOrDash(task.title)}: ${textOrDash(task.description)} (${textOrDash(task.category)}, ${textOrDash(task.estimatedTime)})`,
      );
    });
  });

  return makeSection('30-Day Action Plan', blocks);
};

const buildTechStackSection = (project: Project): ReportSection | undefined => {
  const data = project.data.techStack;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  addBlock(blocks, 'Technologies', 'subheading');
  data.technologies?.forEach((tech) => {
    addBlock(
      blocks,
      `${textOrDash(tech.name)} (${textOrDash(tech.category)}): ${textOrDash(tech.description)}${tech.docs ? `; Docs ${tech.docs}` : ''}`,
    );
  });
  addBlock(blocks, 'Audit Report', 'subheading');
  addBlock(blocks, textOrDash(data.auditReport));

  if (data.diagram) {
    addBlock(blocks, 'Architecture Diagram', 'subheading');
    data.diagram.nodes?.forEach((node) => {
      addBlock(blocks, `Node ${textOrDash(node.id)}: ${textOrDash(node.label)} (${textOrDash(node.type)})`);
    });
    data.diagram.edges?.forEach((edge) => {
      addBlock(blocks, `${textOrDash(edge.source)} -> ${textOrDash(edge.target)}`);
    });
  }

  return makeSection('Tech Stack', blocks);
};

const buildPrdSection = (project: Project): ReportSection | undefined => {
  if (!hasText(project.data.prd)) return undefined;

  return makeSection('PRD Documents', [{ text: markdownToPlainText(project.data.prd) }]);
};

const buildBuilderSection = (project: Project): ReportSection | undefined => {
  const data = project.data.builder;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  addBlock(blocks, `Prompt: ${textOrDash(data.prompt)}`, 'subheading');
  Object.entries(data.answers ?? {}).forEach(([question, answer]) => {
    addBlock(blocks, `${question}: ${textOrDash(answer)}`);
  });

  return makeSection('AI Builder', blocks);
};

const buildMindMapSection = (project: Project): ReportSection | undefined => {
  const data = project.data.mindMap;
  if (!data) return undefined;

  const blocks: ReportBlock[] = [];
  data.nodes?.forEach((node) => {
    addBlock(blocks, `Node ${textOrDash(node.id)}: ${textOrDash(node.data?.label ?? node.id)}`);
  });
  data.edges?.forEach((edge) => {
    addBlock(blocks, `${textOrDash(edge.source)} -> ${textOrDash(edge.target)}`);
  });

  return makeSection('Mind Map', blocks);
};

export const buildProjectReportSections = (project: Project): ReportSection[] =>
  [
    buildOverviewSection(project),
    buildValidationSection(project),
    buildDeepAnalysisSection(project),
    buildBlueprintSection(project),
    buildRoadmapSection(project),
    buildActionPlanSection(project),
    buildTechStackSection(project),
    buildPrdSection(project),
    buildBuilderSection(project),
    buildMindMapSection(project),
  ].filter((section): section is ReportSection => Boolean(section));

export const getProjectReportFilename = (project: Pick<Project, 'name'>): string => {
  const safeName = project.name
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);

  return `${safeName || 'Project'}_Report.pdf`;
};

const getPageWidth = (doc: ReportPdfDocument): number =>
  doc.internal.pageSize.getWidth?.() ?? doc.internal.pageSize.width ?? 210;

const getPageHeight = (doc: ReportPdfDocument): number =>
  doc.internal.pageSize.getHeight?.() ?? doc.internal.pageSize.height ?? 297;

const blockStyle = (style: ReportBlockStyle | undefined) => {
  if (style === 'subheading') return { fontSize: 12, fontStyle: 'bold', color: 24 };
  if (style === 'muted') return { fontSize: 9, fontStyle: 'normal', color: 113 };
  return { fontSize: 10, fontStyle: 'normal', color: 39 };
};

export const renderProjectReportPdf = (doc: ReportPdfDocument, project: Project): ReportPdfDocument => {
  const sections = buildProjectReportSections(project);
  const margin = 18;
  const pageWidth = getPageWidth(doc);
  const pageHeight = getPageHeight(doc);
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 22;
  const lineHeight = 5.4;
  let y = margin;

  doc.setProperties?.({
    title: `${project.name} Report`,
    subject: 'SaaS validation project report',
    creator: 'SaaS Blueprint & Validator',
  });

  const addPage = () => {
    doc.addPage();
    y = margin;
  };

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - bottomMargin) addPage();
  };

  const addText = (text: string, style: ReportBlockStyle = 'body') => {
    const resolved = blockStyle(style);
    doc.setFont('helvetica', resolved.fontStyle);
    doc.setFontSize(resolved.fontSize);
    doc.setTextColor(resolved.color);
    const lines = doc.splitTextToSize(text, contentWidth);
    const height = Math.max(lines.length, 1) * lineHeight + (style === 'subheading' ? 3 : 2);
    ensureSpace(height);
    doc.text(lines, margin, y);
    y += height;
  };

  const addSectionTitle = (title: string) => {
    ensureSpace(18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(9);
    doc.text(title, margin, y);
    y += 6;
    doc.setDrawColor?.(212);
    doc.setLineWidth?.(0.2);
    doc.line?.(margin, y, pageWidth - margin, y);
    y += 8;
  };

  sections.forEach((section, index) => {
    if (index > 0 && section.startOnNewPage) addPage();
    addSectionTitle(section.title);
    section.blocks.forEach((block) => addText(block.text, block.style));
  });

  const pageCount = doc.internal.getNumberOfPages?.() ?? 1;
  if (doc.setPage) {
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      doc.setPage(pageNumber);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(113);
      doc.text(`${project.name} Report`, margin, pageHeight - 10);
      doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    }
  }

  return doc;
};
