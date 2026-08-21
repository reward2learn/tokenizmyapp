import { describe, expect, it } from 'vitest';
import type { AppPackConfig, SuiteAppInstance } from '@/store/apis/tenant-api';
import {
  CEO_OVERVIEW_APP_ID,
  CEO_OVERVIEW_TEMPLATE_ID,
  ensureCeoOverviewInPack,
  hasCeoLikeSuiteApp,
  isCeoOverviewApp,
} from './app-pack-tenant-materializer';

function financeApp(): SuiteAppInstance {
  return {
    appId: 'finance',
    name: 'Finance App',
    department: 'General',
    templateId: CEO_OVERVIEW_TEMPLATE_ID,
    status: 'live',
    appUrl: 'https://example.vercel.app',
    dbUrl: null,
    vercelProjectId: 'prj_1',
  };
}

function emptyPack(apps: SuiteAppInstance[]): AppPackConfig {
  return {
    packId: 'tokenizmyapp-suite',
    name: 'TokenizMyApp Suite',
    description: 'test',
    apps,
    ceoOverview: { purpose: '', kpis: [] },
  };
}

describe('ensureCeoOverviewInPack', () => {
  it('adds a pending ceo-overview when missing (even if Finance already uses financial-analytics)', () => {
    const { pack, addedApp } = ensureCeoOverviewInPack(emptyPack([financeApp()]), {
      displayName: 'TokenizMyApp',
    });

    expect(addedApp?.appId).toBe(CEO_OVERVIEW_APP_ID);
    expect(pack.apps).toHaveLength(2);
    expect(pack.apps.some(isCeoOverviewApp)).toBe(true);
    expect(pack.ceoOverview.purpose).toContain('TokenizMyApp');
    expect(pack.ceoOverview.kpis.length).toBeGreaterThan(0);
  });

  it('is idempotent when ceo-overview already exists', () => {
    const first = ensureCeoOverviewInPack(emptyPack([financeApp()]));
    const second = ensureCeoOverviewInPack(first.pack);

    expect(second.addedApp).toBeNull();
    expect(second.pack.apps.filter(isCeoOverviewApp)).toHaveLength(1);
  });

  it('does not duplicate when an AI-named CEO-like app is present', () => {
    const pack = emptyPack([
      financeApp(),
      {
        appId: 'owner-dashboard',
        name: 'Owner Dashboard',
        department: 'Executive Leadership',
        templateId: CEO_OVERVIEW_TEMPLATE_ID,
        status: 'pending',
        appUrl: null,
        dbUrl: null,
        vercelProjectId: null,
      },
    ]);

    expect(hasCeoLikeSuiteApp(pack.apps)).toBe(true);
    const { addedApp } = ensureCeoOverviewInPack(pack);
    expect(addedApp).toBeNull();
  });
});
