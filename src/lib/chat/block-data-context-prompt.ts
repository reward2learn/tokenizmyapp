/** Format CMS block dataContext for chat message prefix (mirrors sheet-prompt pattern). */
export function buildBlockDataContextNote(dataContext?: {
  blockType?: string;
  config?: Record<string, unknown>;
}): string {
  if (!dataContext?.blockType) return '';
  const cfg = dataContext.config ?? {};
  const cfgLine =
    Object.keys(cfg).length > 0
      ? ` Block settings: ${Object.entries(cfg)
          .map(([k, v]) => `${k}=${String(v)}`)
          .join(', ')}.`
      : '';
  return (
    `[Page block context: discuss live ${dataContext.blockType} data for this section.${cfgLine}]\n\n`
  );
}
