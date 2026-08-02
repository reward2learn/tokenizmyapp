import { decomposePackStep } from './workflows/app-pack-generate/steps';
import { loadKnowledgeBaseStep } from './workflows/app-pack-generate/steps';
import { generateAppStep } from './workflows/app-pack-generate/steps';
import { compileAppPackStep } from './workflows/app-pack-generate/steps';
import { materializeAppPackStep } from './workflows/app-pack-generate/steps';
import { defaultPackId } from './workflows/app-pack-generate/steps';
import type { AppPackGenerateInput } from './workflows/app-pack-generate/types';

async function testMockGeneration() {
  const input: AppPackGenerateInput = {
    prompt: 'Build an app pack for restaurant operations: HR (employees, schedules, attendance), Sales Reporting (daily sales, hourly trends, payment methods), Finance (P&L, cash flow, costs tracking), plus a CEO Overview with cross-department KPIs and realtime actionable items.',
    tenantSlug: 'tokenizmyapp',
    mock: true,
    dbUrl: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
  };

  console.log('Starting mock app pack generation test...');
  console.log('Input:', JSON.stringify(input, null, 2));

  try {
    const packId = input.packId ?? defaultPackId(input.prompt);
    const name = input.name ?? packId;
    const mode = input.mock ? 'mock' : 'ai';

    console.log(`\n📦 Pack ID: ${packId}`);
    console.log(`📝 Name: ${name}`);
    console.log(`🔧 Mode: ${mode}`);

    // ── 1. DECOMPOSE ──────────────────────────────────────────
    console.log('\n🔍 Stage 1: Decomposing requirement...');
    const decomposition = await decomposePackStep(input);
    console.log(`✅ Decomposed into ${decomposition.apps.length} app(s):`);
    decomposition.apps.forEach((a) => console.log(`   - ${a.name} (${a.department})`));
    console.log(`   CEO Overview KPIs: ${decomposition.ceoOverview.kpis.join(', ')}`);

    // ── 1b. KNOWLEDGE GROUNDING ─────────────────────────────
    console.log('\n📚 Stage 1b: Loading knowledge base...');
    const knowledgeBase = await loadKnowledgeBaseStep(input.dbUrl);
    console.log(`✅ Knowledge base loaded (${knowledgeBase.length} chars)`);

    // ── 2. GENERATE each app definition ───────────────────────
    console.log('\n🏗️  Stage 2: Generating app definitions...');
    const definitions = [];
    for (let i = 0; i < decomposition.apps.length; i++) {
      const def = await generateAppStep(input, decomposition, knowledgeBase, i);
      definitions.push(def);
      console.log(`✅ Generated "${def.appName}" — ${def.models.length} model(s), ${def.useCases.length} use case(s), ${def.pages.length} page(s), ${def.knowledgeSnippets.length} knowledge snippet(s)`);
    }

    // ── 3. COMPILE ────────────────────────────────────────────
    console.log('\n⚙️  Stage 3: Compiling app pack...');
    const artifacts = await compileAppPackStep(decomposition, definitions);
    console.log(`✅ Compiled ${artifacts.length} artifact(s)`);

    // ── 4. MATERIALIZE ────────────────────────────────────────
    console.log('\n💾 Stage 4: Materializing to database...');
    const counts = await materializeAppPackStep(input, decomposition, definitions, artifacts);
    console.log(`✅ Materialized:`);
    console.log(`   - ${counts.apps} app(s)`);
    console.log(`   - ${counts.pages} pages`);
    console.log(`   - ${counts.sections} sections`);
    console.log(`   - ${counts.nav} nav items`);
    console.log(`   - ${counts.snippets} knowledge snippets`);
    console.log(`   - ${counts.groups} security group(s)`);

    console.log('\n🎉 Mock app pack generation completed successfully!');
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Pack ID: ${packId}`);
    console.log(`   Name: ${name}`);
    console.log(`   Mock: ${!!input.mock}`);
    console.log(`   CEO Purpose: ${decomposition.ceoOverview.purpose}`);
    console.log(`   CEO KPIs: ${decomposition.ceoOverview.kpis.join(', ')}`);
    console.log(`   Apps: ${definitions.map(d => d.appName).join(', ')}`);
    console.log(`   ZModel length: ${artifacts.map(a => a.zmodel).join('\n\n').length} chars`);

  } catch (error) {
    console.error('\n❌ Mock app pack generation failed:');
    console.error(error);
    process.exit(1);
  }
}

testMockGeneration();
