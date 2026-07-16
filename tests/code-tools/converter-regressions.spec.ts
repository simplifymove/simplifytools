import { expect, test } from '@playwright/test';
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/code/route';

async function execute(tool: string, input: string, options: Record<string, unknown> = {}) {
  const response = await POST(new NextRequest('http://localhost/api/code', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ tool, input, options }),
  }));
  return { status: response.status, body: await response.json() };
}

test('the four converter contracts produce successful API results', async () => {
  const cases = [
    ['json-to-csv', '[{"name":"SimplifyConvert","active":true}]', {}],
    ['json-to-xml', '{"name":"SimplifyConvert","active":true}', {}],
    ['temperature-converter', '25', { fromUnit: 'celsius', toUnit: 'fahrenheit' }],
    ['csv-json-converter', 'name,active\nSimplifyConvert,true', { format: 'csv-to-json' }],
  ] as const;

  for (const [tool, input, options] of cases) {
    const result = await execute(tool, input, options);
    expect(result.status, tool).toBe(200);
    expect(result.body.ok, tool).toBe(true);
    expect(result.body.result, tool).toBeTruthy();
  }
});

test('the bidirectional CSV/JSON converter dispatches JSON to CSV', async () => {
  const result = await execute(
    'csv-json-converter',
    '[{"name":"SimplifyConvert","active":true}]',
    { format: 'json-to-csv' },
  );
  expect(result.status).toBe(200);
  expect(result.body.result.result).toContain('"name","active"');
});
