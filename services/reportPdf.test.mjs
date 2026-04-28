import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const loadModule = async () => {
  const source = await readFile(new URL('./reportPdf.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

const sampleProject = {
  id: 'project-1',
  name: 'Customer Success Copilot',
  description: 'AI assistant for customer success teams.',
  created_at: '2026-04-28T12:00:00.000Z',
  data: {
    validation: {
      projectTitle: 'Customer Success Copilot',
      viabilityScore: 84,
      summary: 'Strong pull from mid-market SaaS teams.',
      radarData: [{ subject: 'Demand', A: 91, fullMark: 100 }],
      revenueData: [{ year: 'Year 1', revenue: 120000, expenses: 45000 }],
      marketStats: { tam: 5000, sam: 850, som: 60 },
      swot: {
        strengths: ['Clear buyer pain'],
        weaknesses: ['Long enterprise sales cycles'],
        opportunities: ['Expansion into onboarding'],
        threats: ['CRM incumbents'],
      },
      competitors: [
        {
          name: 'ChurnZero',
          price: 'Custom',
          gap: 'Limited AI-assisted playbooks',
          url: 'https://example.com/churnzero',
        },
      ],
    },
    deepAnalysis: {
      marketDemand: {
        trendData: [{ month: 'Apr', searchVolume: 2200, interest: 72 }],
        keywords: [{ text: 'customer success automation', value: 88 }],
        audienceSegments: [
          {
            segment: 'VP Customer Success',
            size: '12k buyers',
            painPoint: 'Too many reactive workflows',
          },
        ],
      },
      competitorAnalysis: {
        featureMatrix: [
          {
            feature: 'AI renewal risk detection',
            us: true,
            competitorA: false,
            competitorB: true,
          },
        ],
        competitorNames: { A: 'Gainsight', B: 'Totango' },
      },
      feasibility: {
        technicalDifficulty: 63,
        devTimeMonths: 4,
        infraCost: 920,
        costBreakdown: [{ item: 'Vector database', cost: 180 }],
        risks: [
          {
            risk: 'CRM data quality varies',
            severity: 'High',
            mitigation: 'Add schema mapping and confidence scoring',
          },
        ],
      },
      monetization: {
        strategy: 'Seat-based subscription with usage add-ons.',
        tiers: [
          {
            name: 'Growth',
            price: '$99/user',
            features: ['Renewal risk scoring', 'Playbook automation'],
            highlight: true,
          },
        ],
        projectedMRR: [{ month: 'Month 6', amount: 42000 }],
      },
    },
    blueprint: {
      diagrams: [
        {
          id: 'system',
          title: 'System Architecture',
          type: 'system',
          description: 'React dashboard connected to API and AI workers.',
          nodes: [
            {
              id: 'app',
              data: {
                label: 'React App',
                attributes: ['Dashboard', 'PDF Export'],
              },
            },
          ],
          edges: [{ id: 'edge-1', source: 'app', target: 'api', label: 'REST' }],
        },
      ],
    },
    roadmap: {
      columnOrder: ['todo', 'done'],
      columns: {
        todo: {
          id: 'todo',
          title: 'To Do',
          items: [{ id: 'task-1', content: 'Build Salesforce import', tag: 'Backend' }],
        },
        done: {
          id: 'done',
          title: 'Done',
          items: [{ id: 'task-2', content: 'Interview CS leaders', tag: 'Research' }],
        },
      },
    },
    actionPlan: {
      totalTasks: 2,
      estimatedTotalHours: 14,
      phases: [
        {
          id: 'phase-1',
          name: 'Validation Sprint',
          description: 'Confirm buyer pain.',
          startDay: 1,
          endDay: 7,
          tasks: [
            {
              day: 1,
              title: 'Recruit interviewees',
              description: 'Find five CS leaders.',
              estimatedTime: '3 hours',
              category: 'Research',
            },
          ],
        },
      ],
    },
    techStack: {
      technologies: [
        {
          name: 'React',
          category: 'Frontend',
          icon: 'react',
          docs: 'https://react.dev',
          description: 'Dashboard UI framework',
          color: '#61dafb',
        },
      ],
      auditReport: 'Use managed auth and row-level security.',
      diagram: {
        nodes: [{ id: 'frontend', label: 'Frontend', type: 'client' }],
        edges: [{ id: 'stack-edge', source: 'frontend', target: 'api' }],
      },
    },
    prd: '# Product Requirements\n\nTrack renewal risk before escalation.',
    builder: {
      prompt: 'Create a customer success dashboard',
      answers: {
        audience: 'Customer success managers',
        workflow: 'Daily risk triage',
      },
    },
  },
};

test('buildProjectReportSections includes data from every dashboard page', async () => {
  const { buildProjectReportSections } = await loadModule();
  const sections = buildProjectReportSections(sampleProject);
  const reportText = sections
    .flatMap((section) => [section.title, ...section.blocks.map((block) => block.text)])
    .join('\n');

  assert.match(reportText, /Validation & Market Analysis/);
  assert.match(reportText, /Viability Score: 84\/100/);
  assert.match(reportText, /Strong pull from mid-market SaaS teams/);
  assert.match(reportText, /Demand: 91\/100/);
  assert.match(reportText, /Year 1: Revenue \$120,000; Expenses \$45,000/);
  assert.match(reportText, /ChurnZero/);

  assert.match(reportText, /Deep Insights/);
  assert.match(reportText, /customer success automation: 88/);
  assert.match(reportText, /VP Customer Success/);
  assert.match(reportText, /AI renewal risk detection: Us Yes; Gainsight No; Totango Yes/);
  assert.match(reportText, /CRM data quality varies/);
  assert.match(reportText, /Growth \(\$99\/user\): Renewal risk scoring; Playbook automation/);
  assert.match(reportText, /Month 6: \$42,000/);

  assert.match(reportText, /Blueprint/);
  assert.match(reportText, /System Architecture/);
  assert.match(reportText, /React App/);
  assert.match(reportText, /app -> api \(REST\)/);

  assert.match(reportText, /Roadmap/);
  assert.match(reportText, /To Do/);
  assert.match(reportText, /Build Salesforce import/);

  assert.match(reportText, /30-Day Action Plan/);
  assert.match(reportText, /Total Tasks: 2/);
  assert.match(reportText, /Day 1 - Recruit interviewees/);

  assert.match(reportText, /Tech Stack/);
  assert.match(reportText, /React \(Frontend\): Dashboard UI framework/);
  assert.match(reportText, /Use managed auth and row-level security/);
  assert.match(reportText, /frontend -> api/);

  assert.match(reportText, /PRD Documents/);
  assert.match(reportText, /Track renewal risk before escalation/);

  assert.match(reportText, /AI Builder/);
  assert.match(reportText, /Create a customer success dashboard/);
  assert.match(reportText, /audience: Customer success managers/);
});

test('getProjectReportFilename creates a safe pdf filename', async () => {
  const { getProjectReportFilename } = await loadModule();

  assert.equal(
    getProjectReportFilename({ ...sampleProject, name: 'CRM / Risk: Pilot?' }),
    'CRM_Risk_Pilot_Report.pdf',
  );
});
