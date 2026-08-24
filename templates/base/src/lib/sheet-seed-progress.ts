/**
 * Per-sheet seed / ingest progress helpers.
 * Shared by Config upload UI and the workbook-ingest workflow SSE payloads.
 */

export type SheetSeedPhase =
  | 'queued'
  | 'extracting'
  | 'analyzing'
  | 'mapping'
  | 'comprehending'
  | 'seeding'
  | 'pages'
  | 'done'
  | 'skipped'
  | 'error';

export type SheetSeedState = 'pending' | 'active' | 'completed' | 'skipped' | 'error';

export interface SheetSeedStatus {
  name: string;
  status: SheetSeedState;
  phase?: SheetSeedPhase;
  detail?: string;
}

/** Build a pending checklist from Excel tab names. */
export function sheetStatusesFromNames(names: string[]): SheetSeedStatus[] {
  return names.map((name) => ({
    name,
    status: 'pending' as const,
    phase: 'queued' as const,
  }));
}

/** Merge by sheet name (incoming wins on overlap). Preserves prior order, appends new names. */
export function mergeSheetStatuses(
  prev: SheetSeedStatus[] | undefined,
  next: SheetSeedStatus[] | undefined,
): SheetSeedStatus[] {
  if (!next?.length) return prev ?? [];
  if (!prev?.length) return next;
  const map = new Map<string, SheetSeedStatus>();
  for (const s of prev) map.set(s.name, s);
  for (const s of next) map.set(s.name, { ...map.get(s.name), ...s });
  const order = [...prev.map((s) => s.name)];
  for (const s of next) {
    if (!order.includes(s.name)) order.push(s.name);
  }
  return order.map((name) => map.get(name)!).filter(Boolean);
}

/** Patch one sheet; optionally demote other `active` sheets back to pending/completed. */
export function patchSheetStatus(
  list: SheetSeedStatus[],
  name: string,
  patch: Partial<Omit<SheetSeedStatus, 'name'>>,
  opts?: { exclusiveActive?: boolean },
): SheetSeedStatus[] {
  const exclusive = opts?.exclusiveActive !== false && patch.status === 'active';
  let found = false;
  const out = list.map((s) => {
    if (s.name !== name) {
      if (exclusive && s.status === 'active') {
        return { ...s, status: 'pending' as const };
      }
      return s;
    }
    found = true;
    return { ...s, ...patch, name };
  });
  if (!found) out.push({ name, status: 'pending', ...patch });
  return out;
}

/** Mark every sheet completed (end of pipeline). */
export function completeAllSheets(list: SheetSeedStatus[]): SheetSeedStatus[] {
  return list.map((s) =>
    s.status === 'error' || s.status === 'skipped'
      ? s
      : { ...s, status: 'completed' as const, phase: 'done' as const },
  );
}

export function sheetPhaseLabel(phase?: SheetSeedPhase): string {
  switch (phase) {
    case 'queued':
      return 'Queued';
    case 'extracting':
      return 'Extracting';
    case 'analyzing':
      return 'Analyzing';
    case 'mapping':
      return 'Mapping formulas';
    case 'comprehending':
      return 'AI comprehension';
    case 'seeding':
      return 'Seeding data';
    case 'pages':
      return 'Creating page';
    case 'done':
      return 'Done';
    case 'skipped':
      return 'Skipped';
    case 'error':
      return 'Error';
    default:
      return '';
  }
}
