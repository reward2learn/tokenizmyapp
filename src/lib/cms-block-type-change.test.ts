import { describe, expect, it } from 'vitest';
import { migrateConfigForBlockTypeChange } from '@/lib/cms-block-type-change';

describe('migrateConfigForBlockTypeChange', () => {
  it('preserves layout keys when switching block type', () => {
    const config = {
      animate: { enabled: false },
      grid: { xs: 12 },
      contentGrid: { xs: 6 },
      minTier: 'pin',
      period: '2025-01',
      variant: 'ops',
    };

    const next = migrateConfigForBlockTypeChange('kpi_cards', 'chat_panel', config);

    expect(next.animate).toEqual({ enabled: false });
    expect(next.grid).toEqual({ xs: 12 });
    expect(next.contentGrid).toEqual({ xs: 6 });
    expect(next.minTier).toBe('pin');
    expect(next.period).toBeUndefined();
  });

  it('seeds chat prompts and dataContext when switching from kpi_cards', () => {
    const config = { variant: 'dashboard', period: '2025-03' };
    const next = migrateConfigForBlockTypeChange('kpi_cards', 'chat_panel', config);

    expect(next.emptyStatePrompt).toContain('KPI');
    expect(next.suggestedPrompts).toEqual(expect.arrayContaining([expect.any(String)]));
    expect(next.dataContext).toEqual({
      blockType: 'kpi_cards',
      config: { period: '2025-03', variant: 'dashboard' },
    });
  });

  it('carries variant between kpi_cards and chart_financial', () => {
    const next = migrateConfigForBlockTypeChange(
      'kpi_cards',
      'chart_financial',
      { variant: 'ops' },
    );
    expect(next.variant).toBe('ops');
  });

  it('returns the same config when types match', () => {
    const config = { period: '2025-01' };
    const next = migrateConfigForBlockTypeChange('kpi_cards', 'kpi_cards', config);
    expect(next).toEqual(config);
  });
});
