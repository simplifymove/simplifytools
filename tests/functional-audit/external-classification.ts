import fs from 'node:fs';
import path from 'node:path';
import { loadEnvConfig } from '@next/env';
import type { AuditExecutionClass } from '../../app/lib/audit-category-tools';

async function main() {
  loadEnvConfig(process.cwd());
  const { AUDIT_CATEGORY_DEFINITIONS } = await import('../../app/lib/audit-category-tools');
  const rows = AUDIT_CATEGORY_DEFINITIONS.flatMap((category) => category.tools
    .filter((tool) => tool.functionalAudit.strategy !== 'inactive')
    .map((tool) => ({
      category: category.id,
      toolSlug: tool.slug,
      classification: (tool.functionalAudit.executionClass || 'LOCAL_DETERMINISTIC') as AuditExecutionClass,
      provider: tool.functionalAudit.externalProvider || null,
      rateSensitive: Boolean(tool.functionalAudit.rateSensitive),
    })));
  const counts = rows.reduce((result, row) => {
    result[row.classification] = (result[row.classification] || 0) + 1;
    return result;
  }, {} as Record<AuditExecutionClass, number>);
  const report = { generatedAt: new Date().toISOString(), total: rows.length, counts, tools: rows };
  const destination = path.resolve('tests/functional-audit/external-classification.json');
  fs.writeFileSync(destination, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ total: rows.length, counts }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
