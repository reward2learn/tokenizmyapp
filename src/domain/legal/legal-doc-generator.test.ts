import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { WorkbookAnalysis } from '@/domain/excel/workbook-analyzer';
import {
  buildCapabilityLegalClauses,
  generateLegalDocuments,
} from '@/domain/legal/legal-doc-generator';

vi.mock('@shared/lib/config/tenant', () => ({
  getTenantConfig: () => ({
    slug: 'acme-co',
    displayName: 'Acme Co',
    description: 'Acme operations dashboard',
    appTitle: 'Acme Co',
  }),
  getTenantAppUrl: () => 'https://acme-co.vercel.app',
}));

vi.mock('@shared/lib/config/template-profile', () => ({
  getTemplateIdentity: () => ({ id: 'financial-analytics', label: 'Financial Analytics' }),
  getAssistantProfile: () => ({
    role: 'analyst',
    domain: 'hospitality finance',
    currency: 'IDR',
    keyMetrics: ['revenue'],
    capabilities: ['summarise P&L trends', 'answer break-even questions'],
    answerStyle: ['Be concise'],
  }),
}));

vi.mock('@/lib/page-catalog', () => ({
  getFullCatalog: () => ({
    dashboard: {
      slug: 'dashboard',
      title: 'Dashboard',
      authTier: 'public',
      showInNav: true,
      sections: [],
    },
    summary: {
      slug: 'summary',
      title: 'Executive Summary',
      authTier: 'google',
      showInNav: true,
      sections: [],
    },
    'ops-chat': {
      slug: 'ops-chat',
      title: 'AI Chat',
      authTier: 'google',
      showInNav: true,
      sections: [],
    },
    'terms-of-service': {
      slug: 'terms-of-service',
      title: 'Terms of Service',
      authTier: 'public',
      showInNav: false,
      sections: [],
    },
    'privacy-policy': {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      authTier: 'public',
      showInNav: false,
      sections: [],
    },
  }),
}));

const sampleAnalysis: WorkbookAnalysis = {
  fileName: 'june-workbook.xlsx',
  company: 'Acme Cantina',
  period: 'June 2026',
  sheetCount: 2,
  sheets: [
    {
      tabName: 'Daily Sales',
      slug: 'daily-sales',
      category: 'daily_sales',
      title: 'Daily Sales',
      columns: [],
      rowCount: 30,
      columnCount: 5,
      sampleRows: [],
      hasFinancialData: true,
      hasMultiYearData: false,
      periods: ['June 2026'],
    },
    {
      tabName: 'P&L',
      slug: 'pl',
      category: 'profit_loss',
      title: 'Profit & Loss',
      columns: [],
      rowCount: 40,
      columnCount: 4,
      sampleRows: [],
      hasFinancialData: true,
      hasMultiYearData: false,
      periods: ['June 2026'],
    },
  ],
  categoriesFound: ['daily_sales', 'profit_loss'],
  summary: 'Two financial sheets for June 2026',
};

describe('legal-doc-generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('buildCapabilityLegalClauses includes chat + workbook data bullets', () => {
    const clauses = buildCapabilityLegalClauses(
      ['summarise P&L trends'],
      ['daily_sales', 'profit_loss'],
      [
        { slug: 'dashboard', title: 'Dashboard', authTier: 'public', showInNav: true },
        { slug: 'ops-chat', title: 'AI Chat', authTier: 'google', showInNav: true },
      ],
    );
    expect(clauses.serviceFeatures.some((s) => /chat/i.test(s))).toBe(true);
    expect(clauses.dataProcessed.some((s) => /daily sales/i.test(s))).toBe(true);
    expect(clauses.dataUses.length).toBeGreaterThan(0);
  });

  it('generateLegalDocuments embeds tenant, workbook, and catalog pages', () => {
    const { termsMarkdown, privacyMarkdown, context } = generateLegalDocuments(sampleAnalysis);

    expect(context.businessName).toBe('Acme Cantina');
    expect(context.tenantSlug).toBe('acme-co');
    expect(context.workbook?.fileName).toBe('june-workbook.xlsx');

    expect(termsMarkdown).toContain('Acme Cantina');
    expect(termsMarkdown).toContain('https://acme-co.vercel.app');
    expect(termsMarkdown).toContain('june-workbook.xlsx');
    expect(termsMarkdown).toContain('/terms-of-service');

    expect(privacyMarkdown).toContain('Acme Cantina');
    expect(privacyMarkdown).toContain('daily sales');
    expect(privacyMarkdown).toContain('profit & loss');
  });

  it('generateLegalDocuments works without a workbook analysis', () => {
    const { termsMarkdown, privacyMarkdown, context } = generateLegalDocuments(null);
    expect(context.workbook).toBeNull();
    expect(context.businessName).toBe('Acme Co');
    expect(termsMarkdown).toContain('Acme Co');
    expect(privacyMarkdown).toContain('Acme Co');
  });
});
