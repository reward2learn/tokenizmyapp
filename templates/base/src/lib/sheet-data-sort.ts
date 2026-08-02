/**
 * Server-side (global) sheet sorting.
 *
 * The sheet viewer paginates (200 rows/page) but the user expects sorting to
 * order the ENTIRE column set — including rows that are not loaded into the
 * current page (e.g. a column with 1100 cells while only 100 rows are in
 * view). The GET /api/sheet-data route sorts ALL filtered rows with this
 * module BEFORE pagination, so every page arrives in globally-correct order.
 *
 * Excel semantics: numbers sort numerically (leading zeros/formatting don't
 * matter), text sorts locale-aware with natural numbers ("Row 2" < "Row 10"),
 * blanks sort last in BOTH directions (Excel always pushes empty cells to
 * the bottom of a sort).
 */

export type SheetSortDir = 'asc' | 'desc';
export type SheetSortBy = Array<[string, SheetSortDir]>;

function isEmpty(v: unknown): boolean {
  return v === '' || v === null || v === undefined;
}

/** Excel-style comparison of two cell values (numbers numeric, text locale-aware, blanks last). */
export function compareSheetValues(a: unknown, b: unknown): number {
  const aEmpty = isEmpty(a);
  const bEmpty = isEmpty(b);
  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1; // blanks always sort last
  if (bEmpty) return -1;

  const aStr = String(a);
  const bStr = String(b);
  const aNum = typeof a === 'number' ? a : Number(aStr.replace(/[,\s]/g, ''));
  const bNum = typeof b === 'number' ? b : Number(bStr.replace(/[,\s]/g, ''));
  const aIsNum = typeof a === 'number' || (aStr.trim() !== '' && isFinite(aNum));
  const bIsNum = typeof b === 'number' || (bStr.trim() !== '' && isFinite(bNum));

  if (aIsNum && bIsNum) return aNum - bNum;
  if (aIsNum !== bIsNum) return aIsNum ? -1 : 1; // numbers before text
  return aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Stable multi-key sort over row objects. Input order is preserved for rows
 * that compare equal (stable via index tiebreaker). Blank values always sort
 * last, in BOTH ascending and descending direction (Excel behavior).
 */
export function sortSheetRows<T extends Record<string, unknown>>(
  rows: T[],
  sortBy: SheetSortBy,
): T[] {
  if (sortBy.length === 0) return rows;
  return rows
    .map((row, idx) => ({ row, idx }))
    .sort((x, y) => {
      for (const [field, dir] of sortBy) {
        const av = x.row[field];
        const bv = y.row[field];
        const aEmpty = isEmpty(av);
        const bEmpty = isEmpty(bv);
        if (aEmpty || bEmpty) {
          if (aEmpty && bEmpty) continue;
          return aEmpty ? 1 : -1; // blanks always last, independent of dir
        }
        const c = compareSheetValues(av, bv);
        if (c !== 0) return dir === 'asc' ? c : -c;
      }
      return x.idx - y.idx; // stable
    })
    .map((x) => x.row);
}
