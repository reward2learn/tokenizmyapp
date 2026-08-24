/**
 * SEC EDGAR + Companies House filing scrapers for AI Credits Calculator.
 *
 * Enriches annual revenue estimates. Gracefully degrades when env keys are missing:
 *
 * - `SEC_USER_AGENT` (required for EDGAR) — SEC asks for a descriptive User-Agent
 *   like `TokenizMyApp Billing Bot admin@example.com`. Without it, SEC scrapes are skipped.
 * - `COMPANIES_HOUSE_API_KEY` (optional) — UK Companies House REST API key. Without it,
 *   UK filings are skipped; US/SEC and website analysis still work.
 *
 * Do not invent or commit secrets. Set these on the factory deployment / local env only.
 * Caches payloads 24h in-memory (per process).
 */
import { z } from 'zod';

export const FilingSourceSchema = z.enum(['sec', 'companies_house', 'website', 'admin_override', 'live_org']);
export type FilingSource = z.infer<typeof FilingSourceSchema>;

export const FinancialExtractSchema = z.object({
  annualRevenueUsd: z.object({
    low: z.number().nullable(),
    mid: z.number().nullable(),
    high: z.number().nullable(),
  }),
  currencyOriginal: z.string().nullable(),
  fiscalYear: z.number().nullable(),
  confidence: z.number().min(0).max(1),
  sourceRefs: z.array(
    z.object({
      source: FilingSourceSchema,
      label: z.string(),
      url: z.string().nullable().optional(),
      excerpt: z.string().nullable().optional(),
    }),
  ),
  companyName: z.string().nullable(),
  rawNotes: z.string().nullable().optional(),
});

export type FinancialExtract = z.infer<typeof FinancialExtractSchema>;

export interface FilingScrapeResult {
  sec: FinancialExtract | null;
  companiesHouse: FinancialExtract | null;
  errors: string[];
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

function cacheGet<T>(key: string): T | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value as T;
}

function cacheSet(key: string, value: unknown): void {
  cache.set(key, { at: Date.now(), value });
}

/** Test helper — clear in-memory filing cache. */
export function clearFilingScraperCache(): void {
  cache.clear();
}

function secUserAgent(): string | null {
  return process.env.SEC_USER_AGENT?.trim() || null;
}

function companiesHouseApiKey(): string | null {
  return process.env.COMPANIES_HOUSE_API_KEY?.trim() || null;
}

function emptyExtract(partial?: Partial<FinancialExtract>): FinancialExtract {
  return {
    annualRevenueUsd: { low: null, mid: null, high: null },
    currencyOriginal: null,
    fiscalYear: null,
    confidence: 0,
    sourceRefs: [],
    companyName: null,
    rawNotes: null,
    ...partial,
  };
}

/** Parse revenue-like numbers from text (USD / GBP / millions). */
export function parseRevenueSignals(text: string): {
  candidatesUsd: number[];
  currencyHint: string | null;
} {
  const candidatesUsd: number[] = [];
  let currencyHint: string | null = null;

  const patterns = [
    /(?:total\s+)?(?:net\s+)?(?:revenues?|turnover|sales)\s*(?:of|:)?\s*\$?\s*([\d,.]+)\s*(billion|million|bn|mn|m|b)?/gi,
    /\$\s*([\d,.]+)\s*(billion|million|bn|mn|m|b)?\s+(?:in\s+)?(?:revenues?|turnover|sales)/gi,
    /(?:revenues?|turnover|sales)[^\d]{0,40}£\s*([\d,.]+)\s*(billion|million|bn|mn|m|b)?/gi,
  ];

  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const raw = Number(String(m[1]).replace(/,/g, ''));
      if (!Number.isFinite(raw) || raw <= 0) continue;
      const unit = (m[2] ?? '').toLowerCase();
      let mult = 1;
      if (unit === 'billion' || unit === 'bn' || unit === 'b') mult = 1_000_000_000;
      else if (unit === 'million' || unit === 'mn' || unit === 'm') mult = 1_000_000;
      const full = raw * mult;
      // Heuristic: bare numbers under 10k in filings are usually in millions already stated
      if (full < 10_000 && !unit) continue;
      if (m[0].includes('£')) currencyHint = 'GBP';
      else if (m[0].includes('$')) currencyHint = 'USD';
      const usd = currencyHint === 'GBP' ? full * 1.27 : full;
      candidatesUsd.push(usd);
    }
  }

  return { candidatesUsd, currencyHint };
}

function extractFromCandidates(
  candidates: number[],
  source: FilingSource,
  label: string,
  url: string | null,
  companyName: string | null,
  currencyOriginal: string | null,
  fiscalYear: number | null,
  excerpt: string | null,
): FinancialExtract {
  if (candidates.length === 0) {
    return emptyExtract({
      companyName,
      currencyOriginal,
      fiscalYear,
      confidence: 0.15,
      sourceRefs: [{ source, label, url, excerpt }],
      rawNotes: 'No revenue figure extracted — admin should confirm turnover.',
    });
  }
  const sorted = [...candidates].sort((a, b) => a - b);
  const mid = sorted[Math.floor(sorted.length / 2)] ?? sorted[0];
  return {
    annualRevenueUsd: {
      low: sorted[0],
      mid,
      high: sorted[sorted.length - 1],
    },
    currencyOriginal,
    fiscalYear,
    confidence: Math.min(0.85, 0.4 + sorted.length * 0.1),
    sourceRefs: [{ source, label, url, excerpt }],
    companyName,
    rawNotes: null,
  };
}

async function resolveSecCik(query: string, ua: string): Promise<{ cik: string; name: string } | null> {
  const cacheKey = `sec-cik:${query.toLowerCase()}`;
  const cached = cacheGet<{ cik: string; name: string }>(cacheKey);
  if (cached) return cached;

  // Numeric CIK
  if (/^\d{1,10}$/.test(query.trim())) {
    const cik = query.trim().padStart(10, '0');
    const result = { cik, name: query.trim() };
    cacheSet(cacheKey, result);
    return result;
  }

  const ticker = query.trim().toUpperCase();
  try {
    const res = await fetch('https://www.sec.gov/files/company_tickers.json', {
      headers: { 'User-Agent': ua, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, { cik_str: number | string; ticker: string; title: string }>;
    for (const row of Object.values(data)) {
      if (row.ticker?.toUpperCase() === ticker || row.title?.toLowerCase().includes(query.toLowerCase())) {
        const result = {
          cik: String(row.cik_str).padStart(10, '0'),
          name: row.title,
        };
        cacheSet(cacheKey, result);
        return result;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export async function scrapeSecEdgar(cikOrTicker: string): Promise<FinancialExtract | null> {
  const ua = secUserAgent();
  if (!ua) {
    return emptyExtract({
      confidence: 0,
      rawNotes: 'SEC_USER_AGENT not configured — EDGAR scrape skipped.',
      sourceRefs: [{ source: 'sec', label: 'SEC EDGAR (skipped)', url: null }],
    });
  }

  const cacheKey = `sec-filing:${cikOrTicker.toLowerCase()}`;
  const cached = cacheGet<FinancialExtract>(cacheKey);
  if (cached) return cached;

  const resolved = await resolveSecCik(cikOrTicker, ua);
  if (!resolved) {
    return emptyExtract({
      confidence: 0,
      rawNotes: `Could not resolve SEC CIK/ticker: ${cikOrTicker}`,
      sourceRefs: [{ source: 'sec', label: 'SEC lookup failed', url: null }],
    });
  }

  const cikNoPad = String(Number(resolved.cik));
  const submissionsUrl = `https://data.sec.gov/submissions/CIK${resolved.cik}.json`;

  try {
    const res = await fetch(submissionsUrl, {
      headers: { 'User-Agent': ua, Accept: 'application/json' },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      return emptyExtract({
        companyName: resolved.name,
        confidence: 0,
        rawNotes: `SEC submissions HTTP ${res.status}`,
        sourceRefs: [{ source: 'sec', label: 'SEC submissions', url: submissionsUrl }],
      });
    }
    const data = (await res.json()) as {
      name?: string;
      filings?: { recent?: { form?: string[]; accessionNumber?: string[]; primaryDocument?: string[]; reportDate?: string[] } };
    };
    const recent = data.filings?.recent;
    const forms = recent?.form ?? [];
    let accession: string | null = null;
    let primaryDoc: string | null = null;
    let reportDate: string | null = null;
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      if (form === '10-K' || form === '10-Q' || form === '20-F') {
        accession = recent?.accessionNumber?.[i] ?? null;
        primaryDoc = recent?.primaryDocument?.[i] ?? null;
        reportDate = recent?.reportDate?.[i] ?? null;
        if (form === '10-K') break;
      }
    }

    let text = '';
    let filingUrl: string | null = null;
    if (accession && primaryDoc) {
      const accPath = accession.replace(/-/g, '');
      filingUrl = `https://www.sec.gov/Archives/edgar/data/${cikNoPad}/${accPath}/${primaryDoc}`;
      try {
        const htmlRes = await fetch(filingUrl, {
          headers: { 'User-Agent': ua, Accept: 'text/html' },
          signal: AbortSignal.timeout(30_000),
        });
        if (htmlRes.ok) {
          const html = await htmlRes.text();
          text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 200_000);
        }
      } catch {
        // fall through with empty text
      }
    }

    const { candidatesUsd, currencyHint } = parseRevenueSignals(text || `${data.name ?? ''} revenue`);
    const fiscalYear = reportDate ? Number(reportDate.slice(0, 4)) : null;
    const extract = extractFromCandidates(
      candidatesUsd,
      'sec',
      `SEC ${resolved.name}`,
      filingUrl ?? submissionsUrl,
      data.name ?? resolved.name,
      currencyHint ?? 'USD',
      fiscalYear,
      text ? text.slice(0, 280) : null,
    );
    cacheSet(cacheKey, extract);
    return extract;
  } catch (err) {
    return emptyExtract({
      companyName: resolved.name,
      confidence: 0,
      rawNotes: err instanceof Error ? err.message : String(err),
      sourceRefs: [{ source: 'sec', label: 'SEC EDGAR error', url: submissionsUrl }],
    });
  }
}

export async function scrapeCompaniesHouse(companyNumber: string): Promise<FinancialExtract | null> {
  const key = companiesHouseApiKey();
  const number = companyNumber.trim().toUpperCase();
  if (!number) return null;

  if (!key) {
    return emptyExtract({
      confidence: 0,
      rawNotes: 'COMPANIES_HOUSE_API_KEY not configured — UK filings skipped.',
      sourceRefs: [{ source: 'companies_house', label: 'Companies House (skipped)', url: null }],
    });
  }

  const cacheKey = `ch:${number}`;
  const cached = cacheGet<FinancialExtract>(cacheKey);
  if (cached) return cached;

  const auth = Buffer.from(`${key}:`).toString('base64');
  const companyUrl = `https://api.company-information.service.gov.uk/company/${encodeURIComponent(number)}`;

  try {
    const companyRes = await fetch(companyUrl, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    if (!companyRes.ok) {
      return emptyExtract({
        confidence: 0,
        rawNotes: `Companies House company HTTP ${companyRes.status}`,
        sourceRefs: [{ source: 'companies_house', label: 'Companies House', url: companyUrl }],
      });
    }
    const company = (await companyRes.json()) as {
      company_name?: string;
      accounts?: { last_accounts?: { period_end_on?: string } };
    };

    const filingUrl = `https://api.company-information.service.gov.uk/company/${encodeURIComponent(number)}/filing-history?category=accounts&items_per_page=5`;
    const filingRes = await fetch(filingUrl, {
      headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000),
    });
    let descriptionText = '';
    if (filingRes.ok) {
      const filings = (await filingRes.json()) as {
        items?: Array<{ description?: string; description_values?: Record<string, string> }>;
      };
      descriptionText = (filings.items ?? [])
        .map((i) => `${i.description ?? ''} ${JSON.stringify(i.description_values ?? {})}`)
        .join(' ');
    }

    const blob = `${company.company_name ?? ''} ${descriptionText}`;
    const { candidatesUsd, currencyHint } = parseRevenueSignals(blob);
    const periodEnd = company.accounts?.last_accounts?.period_end_on;
    const fiscalYear = periodEnd ? Number(periodEnd.slice(0, 4)) : null;

    const extract = extractFromCandidates(
      candidatesUsd,
      'companies_house',
      `Companies House ${company.company_name ?? number}`,
      `https://find-and-update.company-information.service.gov.uk/company/${number}`,
      company.company_name ?? null,
      currencyHint ?? 'GBP',
      fiscalYear,
      descriptionText.slice(0, 280) || null,
    );
    // Companies House free API rarely embeds turnover; keep confidence honest.
    if (candidatesUsd.length === 0) {
      extract.confidence = Math.min(extract.confidence, 0.25);
      extract.rawNotes =
        'Company profile found; turnover not present in public filing-history summaries. Confirm annual revenue manually.';
    }
    cacheSet(cacheKey, extract);
    return extract;
  } catch (err) {
    return emptyExtract({
      confidence: 0,
      rawNotes: err instanceof Error ? err.message : String(err),
      sourceRefs: [{ source: 'companies_house', label: 'Companies House error', url: companyUrl }],
    });
  }
}

export async function scrapeFilings(input: {
  secCikOrTicker?: string | null;
  companiesHouseNumber?: string | null;
}): Promise<FilingScrapeResult> {
  const errors: string[] = [];
  const tasks: Promise<void>[] = [];
  let sec: FinancialExtract | null = null;
  let companiesHouse: FinancialExtract | null = null;

  if (input.secCikOrTicker?.trim()) {
    tasks.push(
      scrapeSecEdgar(input.secCikOrTicker.trim())
        .then((r) => {
          sec = r;
          if (r?.rawNotes?.includes('skipped') || r?.rawNotes?.includes('not configured')) {
            errors.push(r.rawNotes);
          }
        })
        .catch((err) => {
          errors.push(err instanceof Error ? err.message : String(err));
        }),
    );
  }

  if (input.companiesHouseNumber?.trim()) {
    tasks.push(
      scrapeCompaniesHouse(input.companiesHouseNumber.trim())
        .then((r) => {
          companiesHouse = r;
          if (r?.rawNotes?.includes('skipped') || r?.rawNotes?.includes('not configured')) {
            errors.push(r.rawNotes);
          }
        })
        .catch((err) => {
          errors.push(err instanceof Error ? err.message : String(err));
        }),
    );
  }

  await Promise.all(tasks);
  return { sec, companiesHouse, errors };
}

/** Merge mid estimates preferring higher-confidence sources; admin override wins outside. */
export function mergeRevenueEstimates(
  parts: Array<FinancialExtract | null | undefined>,
): FinancialExtract {
  const present = parts.filter(Boolean) as FinancialExtract[];
  if (present.length === 0) return emptyExtract({ confidence: 0 });

  const mids = present
    .map((p) => p.annualRevenueUsd.mid)
    .filter((n): n is number => n != null && n > 0);
  const lows = present
    .map((p) => p.annualRevenueUsd.low)
    .filter((n): n is number => n != null && n > 0);
  const highs = present
    .map((p) => p.annualRevenueUsd.high)
    .filter((n): n is number => n != null && n > 0);

  const best = [...present].sort((a, b) => b.confidence - a.confidence)[0];
  return {
    annualRevenueUsd: {
      low: lows.length ? Math.min(...lows) : null,
      mid: mids.length ? mids.reduce((a, b) => a + b, 0) / mids.length : best.annualRevenueUsd.mid,
      high: highs.length ? Math.max(...highs) : null,
    },
    currencyOriginal: best.currencyOriginal,
    fiscalYear: best.fiscalYear,
    confidence: Math.min(0.9, Math.max(...present.map((p) => p.confidence))),
    sourceRefs: present.flatMap((p) => p.sourceRefs),
    companyName: present.find((p) => p.companyName)?.companyName ?? null,
    rawNotes: present.map((p) => p.rawNotes).filter(Boolean).join(' · ') || null,
  };
}
