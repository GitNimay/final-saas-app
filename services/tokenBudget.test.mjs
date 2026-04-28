import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const loadModule = async () => {
  const source = await readFile(new URL('./tokenBudget.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

test('compactText collapses whitespace and caps long input', async () => {
  const { compactText } = await loadModule();

  assert.equal(compactText('  SaaS\n\nidea\twith   spacing  ', 80), 'SaaS idea with spacing');

  const compacted = compactText('x'.repeat(40), 16);

  assert.ok(compacted.length <= 16);
  assert.ok(compacted.endsWith('...'));
});

test('limitHistoryForCost keeps only recent compact messages', async () => {
  const { limitHistoryForCost } = await loadModule();

  const result = limitHistoryForCost(
    [
      { role: 'user', content: 'first message' },
      { role: 'assistant', content: 'second message' },
      { role: 'user', content: 'third message with a lot of detail' },
      { role: 'assistant', content: 'fourth message with a lot of detail' },
    ],
    { maxMessages: 2, maxCharsPerMessage: 18 },
  );

  assert.equal(result.length, 2);
  assert.deepEqual(
    result.map((message) => message.role),
    ['user', 'assistant'],
  );
  assert.ok(result.every((message) => message.content.length <= 18));
  assert.match(result[0].content, /^third message/);
});

test('request budgets provide bounded output for expensive workflows', async () => {
  const { getRequestBudget } = await loadModule();

  const blueprint = getRequestBudget('blueprint');
  const consultant = getRequestBudget('consultant');

  assert.ok(blueprint.maxOutputTokens > consultant.maxOutputTokens);
  assert.ok(consultant.maxOutputTokens <= 800);
  assert.ok(getRequestBudget('unknown').maxOutputTokens <= 1800);
});

test('buildCostAwareSystemInstruction adds compact output guidance', async () => {
  const { buildCostAwareSystemInstruction } = await loadModule();

  const text = buildCostAwareSystemInstruction('Base instruction.', true);

  assert.match(text, /Base instruction\./);
  assert.match(text, /compact JSON/);
  assert.match(text, /Do not add unused fields/);
});
