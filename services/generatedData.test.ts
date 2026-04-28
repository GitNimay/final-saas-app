import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeActionPlanData,
  normalizeBlueprintData,
  normalizeDeepAnalysisData,
} from './generatedData.ts';

test('normalizes blueprint diagrams with missing nested arrays', () => {
  const result = normalizeBlueprintData({
    diagrams: [
      {
        title: 'System Architecture',
        type: 'system',
        description: 'Core system flow',
      },
    ],
  });

  assert.equal(result.diagrams.length, 1);
  assert.deepEqual(result.diagrams[0].nodes, []);
  assert.deepEqual(result.diagrams[0].edges, []);
});

test('normalizes action plan phases with missing tasks', () => {
  const result = normalizeActionPlanData({
    phases: [
      {
        id: 'validation',
        name: 'Validation Week',
        startDay: 1,
        endDay: 7,
      },
    ],
  });

  assert.equal(result.phases.length, 1);
  assert.deepEqual(result.phases[0].tasks, []);
  assert.equal(result.totalTasks, 0);
});

test('normalizes deep analysis collections and nested tier features', () => {
  const result = normalizeDeepAnalysisData({
    marketDemand: {},
    competitorAnalysis: {},
    feasibility: {},
    monetization: {
      tiers: [{ name: 'Pro', price: '$29' }],
    },
  });

  assert.deepEqual(result.marketDemand.trendData, []);
  assert.deepEqual(result.marketDemand.audienceSegments, []);
  assert.deepEqual(result.competitorAnalysis.featureMatrix, []);
  assert.deepEqual(result.feasibility.costBreakdown, []);
  assert.deepEqual(result.feasibility.risks, []);
  assert.deepEqual(result.monetization.tiers[0].features, []);
  assert.deepEqual(result.monetization.projectedMRR, []);
});
