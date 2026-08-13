import { describe, it, expect } from 'vitest';
import { compileAppRows } from './app-pack-compiler';
import type { AppPackAppDefinition } from './app-pack-schema';

/** Minimal AppPackAppDefinition fixture: 2 models, 1 AI page, nav. */
function makeDef(overrides: Partial<AppPackAppDefinition> = {}): AppPackAppDefinition {
  return {
    appId: 'reservations',
    appName: 'Reservations',
    department: 'Front of House',
    w3cStandard: 'x',
    schemaOrgType: 'x',
    models: [
      { name: 'Reservation', tableName: 'reservations', fields: [] },
      { name: 'Guest', tableName: 'guests', fields: [] },
    ],
    useCases: [],
    pages: [
      { slug: 'overview', title: 'Overview', authTier: 'pin', blockTypes: ['kpi_cards'], navLabel: 'Overview' },
    ],
    nav: { label: 'Reservations', icon: 'CalendarMonth', pages: ['overview'] },
    uxWorkflow: [],
    knowledgeSnippets: [],
    ...overrides,
  };
}

describe('compileAppRows — model CRUD pages', () => {
  const def = makeDef();
  const rows = compileAppRows(def, 'tenant-a', 'ops-pack');

  it('appends exactly one CRUD page and one nav row per model', () => {
    const modelPages = rows.pages.filter((p) => p.id.includes('_model_'));
    expect(modelPages).toHaveLength(def.models.length);
    const modelNav = rows.nav.filter((n) => n.id.includes('_model_'));
    expect(modelNav).toHaveLength(def.models.length);
  });

  it('emits pack_table sections with the model table and name', () => {
    for (const model of def.models) {
      const page = rows.pages.find((p) => p.id === `page_ops-pack_reservations_model_${model.tableName}`);
      expect(page).toBeDefined();
      expect(page!.sections).toHaveLength(1);
      expect(page!.sections[0].blockType).toBe('pack_table');
      expect(page!.sections[0].config).toEqual({ table: model.tableName, title: model.name });
    }
  });

  it('pluralizes model names for titles and nav labels', () => {
    const page = rows.pages.find((p) => p.id === 'page_ops-pack_reservations_model_reservations');
    expect(page!.title).toBe('Reservations');
    expect(page!.navLabel).toBe('Reservations');
    expect(page!.showInNav).toBe(true);
    expect(page!.authTier).toBe('pin');
  });

  it('keeps slugs flat and unique (no collisions with AI pages)', () => {
    const slugs = rows.pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const model of def.models) {
      const slug = `ops-pack-reservations-${model.tableName}`;
      expect(slug).toMatch(/^[a-z0-9-]+$/); // flat, URL-safe
      expect(slugs).toContain(slug);
    }
  });

  it('adds nav rows pointing at appended pages with the app group', () => {
    for (const model of def.models) {
      const nav = rows.nav.find((n) => n.id === `nav_ops-pack_reservations_model_${model.tableName}`);
      expect(nav).toBeDefined();
      expect(nav!.path).toBe(`/ops-pack-reservations-${model.tableName}`);
      expect(nav!.requiredGroups).toBe('app_reservations');
      expect(nav!.isDynamic).toBe(true);
      expect(nav!.icon).toBe('');
    }
  });

  it('orders model nav children after AI nav pages', () => {
    const aiSortOrders = rows.nav.filter((n) => !n.id.includes('_model_')).map((n) => n.sortOrder);
    const modelSortOrders = rows.nav.filter((n) => n.id.includes('_model_')).map((n) => n.sortOrder);
    expect(Math.max(...aiSortOrders)).toBeLessThan(Math.min(...modelSortOrders));
  });

  it('leaves existing AI pages and nav untouched', () => {
    const aiPage = rows.pages.find((p) => p.slug === 'ops-pack-reservations-overview');
    expect(aiPage).toBeDefined();
    expect(aiPage!.title).toBe('Overview');
    expect(aiPage!.sections).toEqual([{ blockType: 'kpi_cards', config: {} }]);
    const aiNav = rows.nav.find((n) => n.id === 'nav_ops-pack_reservations_overview');
    expect(aiNav).toBeDefined();
    expect(aiNav!.path).toBe('/ops-pack-reservations-overview');
    expect(aiNav!.sortOrder).toBe(1);
  });

  it('keeps already-plural model names as-is', () => {
    const def2 = makeDef({
      models: [
        { name: 'Sales', tableName: 'sales', fields: [] },
        { name: 'Category', tableName: 'categories', fields: [] },
      ],
    });
    const rows2 = compileAppRows(def2, 'tenant-a', 'ops-pack');
    const sales = rows2.pages.find((p) => p.id === 'page_ops-pack_reservations_model_sales');
    expect(sales!.title).toBe('Sales');
    const category = rows2.pages.find((p) => p.id === 'page_ops-pack_reservations_model_categories');
    expect(category!.title).toBe('Categories');
  });
});
