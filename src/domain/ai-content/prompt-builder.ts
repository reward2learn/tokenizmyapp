/**
 * Prompt Builder
 *
 * Takes extracted Excel data and builds a template-aware system prompt
 * that instructs the AI to generate business review and executive summary content.
 */

import type { ExcelData, PlLine, BepMonthlyRow, MonthOnMonthLine } from '@/domain/excel/excel-extractor';
import { getTenantConfig } from '@shared/lib/config/tenant';
import { getAssistantProfile, getTemplateIdentity } from '@shared/lib/config/template-profile';
import { resolveTemplateRoles } from '@/domain/tenant/template-default-roles';
import { getTemplate } from '@/domain/tenant/template-catalog';

// ── Formatting helpers ──────────────────────────────────

function fmtIdrExact(n: number): string {
  return `IDR ${Math.round(n).toLocaleString('id-ID')}`;
}

function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ── Section builders ────────────────────────────────────

function buildCompanyInfoSection(data: ExcelData): string {
  const tenant = getTenantConfig();
  return [
    `## Company Information`,
    `- **Company**: ${data.company || tenant.displayName}`,
    `- **Period**: ${data.period}`,
    `- **Workbook**: ${data.workbookName}`,
    `- **Tenant**: ${tenant.slug}`,
    ``,
  ].join('\n');
}

function buildProfitAndLossSection(lines: PlLine[]): string {
  if (!lines.length) return '';
  const tableRows = lines.map(
    (l) => `| ${l.accountCode} | ${l.description} | ${fmtIdrExact(l.amount)} |`,
  );
  return [
    `## Profit & Loss — June 2026`,
    ``,
    `| Account | Description | Amount (IDR) |`,
    `|---------|-------------|-------------|`,
    ...tableRows,
    ``,
  ].join('\n');
}

function buildBepSection(rows: BepMonthlyRow[]): string {
  if (!rows.length) return '';
  const tableRows = rows.map(
    (r) => `| ${r.period} | ${fmtIdrExact(r.totalRevenue)} | ${fmtIdrExact(r.totalCos)} | ${fmtPct(r.grossMarginPct)} | ${fmtIdrExact(r.totalFixedCost)} | ${fmtIdrExact(r.bepRevenue)} | ${r.bepCoverage.toFixed(2)}x |`,
  );
  return [
    `## Break-Even Point Analysis (Monthly)`,
    ``,
    `| Period | Revenue | COS | Gross Margin | Fixed Cost | BEP Revenue | BEP Coverage |
|--------|---------|-----|-------------|-----------|-------------|--------------|
${tableRows.join('\n')}`,
    ``,
  ].join('\n');
}

function buildMonthOnMonthSection(lines: MonthOnMonthLine[]): string {
  if (!lines.length) return '';
  const tableRows = lines.map(
    (l) => `| ${l.description} | ${fmtIdrExact(l.previousMonth)} | ${fmtIdrExact(l.currentMonth)} | ${(l.changePct * 100).toFixed(1)}% |`,
  );
  return [
    `## Month-on-Month Comparison (Previous Month vs June 2026)`,
    ``,
    `| Description | Previous Month | Current Month | Change |
|-------------|---------------|--------------|--------|
${tableRows.join('\n')}`,
    ``,
  ].join('\n');
}

function buildMonthlyVarianceSection(data: ExcelData): string {
  const rows = data.monthlyVariance;
  if (!rows.length) return '';
  const tableRows = rows.map(
    (r) => `| ${r.item} | ${fmtIdrExact(r.mayValue)} | ${fmtIdrExact(r.juneValue)} | ${fmtIdrExact(r.variance)} | ${(r.variancePct * 100).toFixed(1)}% |`,
  );
  return [
    `## Monthly Variance (May 2026 vs June 2026)`,
    ``,
    `| Item | May 2026 | June 2026 | Variance | Variance % |
|------|---------|----------|---------|-----------|
${tableRows.join('\n')}`,
    ``,
  ].join('\n');
}

function buildDailySalesSection(data: ExcelData): string {
  const ds = data.dailySales;
  const terraceTotal = Object.values(ds.totals).reduce((a, b) => a + b, 0);
  const avgSpend = Object.values(ds.spendPerGuest).filter((v) => v > 0);
  const avgSpendValue = avgSpend.length ? avgSpend.reduce((a, b) => a + b, 0) / avgSpend.length : 0;

  return [
    `## Daily Sales Summary`,
    ``,
    `### Terrace Revenue`,
    `- **Total Terrace Revenue for month**: ${fmtIdrExact(terraceTotal)}`,
    ds.terraceRevenue.length ? ds.terraceRevenue.map(
      (r) => `- **${r.description}**: ${fmtIdrExact(Object.values(r.dailyValues).reduce((a, b) => a + b, 0))}`,
    ).join('\n') : '- No detailed data',
    ``,
    `### Club Revenue`,
    ds.clubRevenue.length ? ds.clubRevenue.map(
      (r) => `- **${r.description}**: ${fmtIdrExact(Object.values(r.dailyValues).reduce((a, b) => a + b, 0))}`,
    ).join('\n') : '- No detailed data',
    ``,
    `### Spend per Guest (daily average): ${fmtIdrExact(Math.round(avgSpendValue))}`,
    ``,
  ].join('\n');
}

function buildSummaryPlSection(data: ExcelData): string {
  if (!data.summaryPl.length) return '';
  const sections = data.summaryPl.map((year) => {
    const lines = year.lines.map(
      (l) => `| ${l.description} | ${fmtIdrExact(l.amount)} |`,
    );
    return [
      `### ${year.year}`,
      `| Description | Amount |
|-------------|--------|
${lines.join('\n')}`,
    ].join('\n');
  });
  return [
    `## Multi-Year P&L Summary`,
    ``,
    sections.join('\n\n'),
    ``,
  ].join('\n');
}

function buildBalanceSheetSection(data: ExcelData): string {
  if (!data.balanceSheet.length) return '';
  const rows = data.balanceSheet.map(
    (l) => `| ${l.description} | ${fmtIdrExact(l.amount)} |`,
  );
  return [
    `## Balance Sheet — June 2026`,
    ``,
    `| Description | Amount |
|-------------|--------|
${rows.join('\n')}`,
    ``,
  ].join('\n');
}

// ── Template-aware instruction blocks ───────────────────

function roleCodesForPrompt(): string {
  const { id } = getTemplateIdentity();
  const roles = resolveTemplateRoles(getTemplate(id || 'default'));
  return roles
    .filter((r) => !r.isPlatformAdmin)
    .map((r) => r.code)
    .join(', ');
}

function buildGenerationInstructions(businessName: string): string[] {
  const profile = getAssistantProfile();
  const { id } = getTemplateIdentity();
  const roleCodes = roleCodesForPrompt();
  const currency = profile.currency;

  if (id === 'financial-analytics') {
    return [
      `You are a ${profile.role} for ${businessName} covering ${profile.domain}.`,
      `Your task is to generate TWO documents based EXCLUSIVELY on the financial data provided below.`,
      ``,
      `Frame the analysis around business performance, risks, and actionable recommendations for management.`,
      ``,
      `## CRITICAL OUTPUT INSTRUCTIONS`,
      ``,
      `You MUST respond with a valid JSON object. The primary document keys are "businessReview" and "executiveSummary".`,
      `A companion dashboard generation step ALSO requests "homeHero" and "tasks" — do not omit operational deliverables.`,
      `Do NOT include any text outside the JSON object. The JSON must be parseable.`,
      ``,
      `### Output Format`,
      `\`\`\`json`,
      `{`,
      `  "businessReview": "# ${businessName} — Business Review\\n\\n## Part A: Current Situation...",`,
      `  "executiveSummary": "# ${businessName} — Executive Summary\\n\\n## Overview...",`,
      `  "homeHero": { "badge": "Overview", "headline": "...", "subtitle": "...", "accent": "..." },`,
      `  "tasks": [`,
      `    { "title": "...", "priority": "P0", "ownerCodes": ["finance"], "dueOffsetDays": 7, "description": "..." }`,
      `  ]`,
      `}`,
      `\`\`\``,
      ``,
      `### Home page (homeHero)`,
      `Provide a concise management hero grounded in the data.`,
      ``,
      `### Tasks page (tasks)`,
      `Provide 8–15 concrete tasks. Each task: title, priority (P0|P1|P2), ownerCodes (role codes: ${roleCodes}), dueOffsetDays, description.`,
      ``,
      `### Business Review Requirements`,
      `Multi-part Markdown review: current situation, performance trajectory, revenue & pricing, cost management, risk register, immediate actions.`,
      `Use ${currency} for monetary amounts unless the source data specifies another currency.`,
      ``,
      `### Executive Summary Requirements`,
      `Management summary: diagnosis, key risks, stakeholder actions by role (${roleCodes}), and ranked next steps. Analytical tone.`,
    ];
  }

  return [
    `You are a ${profile.role} for ${businessName} covering ${profile.domain}.`,
    `Generate TWO documents from the data below: a business review and an executive summary.`,
    ``,
    `## CRITICAL OUTPUT INSTRUCTIONS`,
    ``,
    `Respond with valid JSON: "businessReview", "executiveSummary", "homeHero", and "tasks".`,
    `Do NOT include any text outside the JSON object.`,
    ``,
    `### tasks`,
    `8–15 tasks with title, priority (P0|P1|P2), ownerCodes (role codes: ${roleCodes}), dueOffsetDays, description.`,
    ``,
    `### businessReview`,
    `Multi-part Markdown review grounded in the data: current situation, key metrics (${profile.keyMetrics.join(', ')}), risks, and immediate actions.`,
    `Quote amounts in ${currency} unless the data states otherwise.`,
    ``,
    `### executiveSummary`,
    `Concise management summary: headline findings, risks, and next steps by role (${roleCodes}).`,
  ];
}

function buildDashboardInstructions(businessName: string): string[] {
  const profile = getAssistantProfile();
  const roleCodes = roleCodesForPrompt();
  const currency = profile.currency;
  const metrics = profile.keyMetrics.length > 0
    ? profile.keyMetrics.join(', ')
    : 'revenue, costs, margin, volume';

  return [
    `# ${businessName} Dashboard Data Generation`,
    ``,
    `You are a ${profile.role} for ${businessName}. Based on the financial data below, generate structured JSON for the dashboard.`,
    ``,
    `Return ONLY a JSON object with: "actionPhases", "targetRows", "levers", "homeHero", and "tasks".`,
    ``,
    `### homeHero`,
    `Fields: badge, headline, accent (optional), subtitle — grounded in the data.`,
    ``,
    `### tasks`,
    `8–15 objects: title, priority ("P0"|"P1"|"P2"), ownerCodes (role codes: ${roleCodes}), dueOffsetDays, description.`,
    ``,
    `### actionPhases`,
    `3 phases with id, title, period, impact, actions (string array). Themes: stabilise, grow, scale.`,
    ``,
    `### targetRows`,
    `5 rows using domain metrics: ${metrics}. Fields: metric, may, conservative, realistic, aspirational, bold (optional).`,
    ``,
    `### levers`,
    `5 strategic levers for ${profile.domain}: num, title, summary, details (5–8 items each).`,
    `Quote monetary figures in ${currency} unless the source data specifies otherwise.`,
    ``,
    `## SOURCE DATA`,
    ``,
  ];
}

// ── Main prompt builder ─────────────────────────────────

export function buildGenerationPrompt(data: ExcelData, additionalContext?: string): string {
  const tenant = getTenantConfig();
  const businessName = data.company || tenant.displayName;
  const sections: string[] = [
    `# ${businessName} — AI Content Generation Prompt`,
    ``,
    ...buildGenerationInstructions(businessName),
    ``,
    `## SOURCE DATA — USE THIS DATA ONLY`,
    ``,
  ];

  // Append all data sections
  sections.push(buildCompanyInfoSection(data));
  sections.push(buildProfitAndLossSection(data.profitAndLoss));
  sections.push(buildBalanceSheetSection(data));
  sections.push(buildBepSection(data.bepMonthly));
  sections.push(buildMonthOnMonthSection(data.monthOnMonth));
  sections.push(buildMonthlyVarianceSection(data));
  sections.push(buildDailySalesSection(data));
  sections.push(buildSummaryPlSection(data));

  // Append additional context from AI Findings (if provided by user selection)
  if (additionalContext) {
    sections.push('');
    sections.push('## Additional Context — AI Findings');
    sections.push('The following insights were flagged by management during AI chat sessions. Incorporate this information into the review where relevant:');
    sections.push('');
    sections.push(additionalContext);
    sections.push('');
  }

  // Close with final reminder
  sections.push(``);
  sections.push(`## Final Reminder`);
  sections.push(`Return ONLY a JSON object. Required document keys: "businessReview" and "executiveSummary" (Markdown strings).`);
  sections.push(`Also include "homeHero" and "tasks" when producing the full content package so Home and Tasks pages can be delivered.`);
  sections.push(`businessReview and executiveSummary values must be valid Markdown strings.`);
  sections.push(`Use proper Markdown tables, headers, and formatting.`);
  sections.push(`Base ALL numbers and analysis on the data provided above. Do not fabricate data.`);
  sections.push(``);

  return sections.join('\n');
}

/**
 * Build a human-readable summary of the extracted data for the admin UI.
 */
export function buildDataSummary(data: ExcelData): string {
  const lines: string[] = [
    `**Workbook**: ${data.workbookName}`,
    `**Period**: ${data.period}`,
    `**Company**: ${data.company}`,
    ``,
    `**Data Extracted**:`,
  ];

  if (data.profitAndLoss.length) {
    const totalIncome = data.profitAndLoss.find((l) => l.accountCode === '4-9999');
    const totalCos = data.profitAndLoss.find((l) => l.accountCode === '5-9999');
    lines.push(`- P&L: ${data.profitAndLoss.length} line items${totalIncome ? `, Total Income: ${fmtIdrExact(totalIncome.amount)}` : ''}${totalCos ? `, Total COS: ${fmtIdrExact(totalCos.amount)}` : ''}`);
  }
  if (data.balanceSheet.length) {
    lines.push(`- Balance Sheet: ${data.balanceSheet.length} entries`);
  }
  if (data.bepMonthly.length) {
    const latest = data.bepMonthly[data.bepMonthly.length - 1];
    lines.push(`- BEP Analysis: ${data.bepMonthly.length} months, Latest: ${latest.period} (Coverage: ${latest.bepCoverage.toFixed(2)}x)`);
  }
  if (data.monthOnMonth.length) {
    lines.push(`- Month-on-Month: ${data.monthOnMonth.length} line items`);
  }
  if (data.monthlyVariance.length) {
    lines.push(`- Variance Analysis: ${data.monthlyVariance.length} metrics`);
  }
  if (data.summaryPl.length) {
    lines.push(`- Multi-Year P&L: ${data.summaryPl.length} years`);
  }

  return lines.join('\n');
}

/**
 * Build a prompt for generating structured dashboard data (action plan, targets, levers).
 * This is called as a third AI phase after the Business Review and Executive Summary.
 */
export function buildDashboardPrompt(data: ExcelData, additionalContext?: string): string {
  const tenant = getTenantConfig();
  const businessName = data.company || tenant.displayName;
  const sections: string[] = [
    ...buildDashboardInstructions(businessName),
    buildCompanyInfoSection(data),
    buildProfitAndLossSection(data.profitAndLoss),
    buildBepSection(data.bepMonthly),
    buildMonthOnMonthSection(data.monthOnMonth),
    buildMonthlyVarianceSection(data),
  ];

  if (additionalContext) {
    sections.push('');
    sections.push('## Additional Context — AI Findings');
    sections.push(additionalContext);
  }

  return sections.join('\n');
}
