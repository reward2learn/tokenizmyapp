import { start } from 'workflow/api';
import { handleAppPackGenerate } from './workflows/app-pack-generate';
import type { AppPackGenerateInput } from './workflows/app-pack-generate/types';

async function testAppPack() {
  const input: AppPackGenerateInput = {
    prompt: 'Build an app pack for restaurant operations: HR (employees, schedules, attendance), Sales Reporting (daily sales, hourly trends, payment methods), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    tenantSlug: 'tokenizmyapp',
    mock: true,
    dbUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  };

  console.log('Starting app pack generation test...');
  console.log('Input:', JSON.stringify(input, null, 2));

  try {
    const run = await start(handleAppPackGenerate, [input]);
    console.log('\n✅ Workflow started successfully!');
    console.log('Run ID:', run.runId);
    
    // Wait for completion
    const result = await run.result();
    console.log('\n✅ App pack generation completed successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ App pack generation failed:');
    console.error(error);
    process.exit(1);
  }
}

testAppPack();
