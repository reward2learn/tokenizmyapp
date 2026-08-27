import { describe, expect, it } from 'vitest';
import { dedupeSheetPagesByRoutePath } from '@/lib/navigation/db';

describe('dedupeSheetPagesByRoutePath', () => {
  it('collapses legacy and suite-prefixed slugs to one route path', () => {
    const result = dedupeSheetPagesByRoutePath(
      [
        { slug: 'sheet-daily-sales', title: 'Daily Sales (legacy)' },
        { slug: 'finance-sheet-daily-sales', title: 'Daily Sales' },
        { slug: 'finance-sheet-pl', title: 'P&L' },
      ],
      'finance',
    );

    expect(result).toEqual([
      { title: 'Daily Sales', path: '/sheet-daily-sales' },
      { title: 'P&L', path: '/sheet-pl' },
    ]);
  });

  it('keeps legacy title when no prefixed twin exists', () => {
    expect(
      dedupeSheetPagesByRoutePath([{ slug: 'sheet-cash', title: 'Cash' }], 'finance'),
    ).toEqual([{ title: 'Cash', path: '/sheet-cash' }]);
  });

  it('passes through unprefixed sheets when appId is empty', () => {
    expect(
      dedupeSheetPagesByRoutePath(
        [
          { slug: 'sheet-a', title: 'A' },
          { slug: 'sheet-a', title: 'A2' },
        ],
        '',
      ),
    ).toEqual([{ title: 'A', path: '/sheet-a' }]);
  });
});
