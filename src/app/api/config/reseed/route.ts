import { NextResponse } from 'next/server';
import { requireWriteAuth, requireCapability } from '@/lib/auth/guards';
import { jsonError, jsonOk } from '@/lib/api/response';
import {
  CONFIG_UPLOAD_FIELD_NAMES,
  MAX_EXCEL_BYTES,
  MAX_MARKDOWN_BYTES,
  validateExcelUpload,
  validateMarkdownUpload,
} from '@/lib/config/upload-validation';
import { resolveOpenAiKey } from '@/lib/openai';
import { seedFromSources, type SeedCounts } from '@/domain/seed/seed-runner';
import type { SourceFileKey } from '@/domain/seed/source-files';
import type { AiPipelineResult } from '@/domain/ai-workbook/pipeline';
import { start } from 'workflow/api';
import { handleWorkbookIngest } from '../../../../../workflows/workbook-ingest';
import type { WorkbookIngestInput } from '../../../../../workflows/workbook-ingest/types';

export const maxDuration = 300; // 5 min — workbook analysis + full DB seed can be heavy

export interface ReseedResponse {
  counts: SeedCounts;
  filesUsed: Record<SourceFileKey, 'upload' | 'disk'>;
  uploaded: SourceFileKey[];
  /** Result of the AI workbook comprehension pipeline (AI mode). */
  aiPipeline?: AiPipelineResult & { skipped?: boolean };
  warnings?: string[];
}

function fileFromForm(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

function filesFromForm(formData: FormData, key: string): File[] {
  const files: File[] = [];
  // FormData.getAll returns all entries with the same key
  if (typeof formData.getAll === 'function') {
    for (const value of formData.getAll(key)) {
      if (value instanceof File && value.size > 0) files.push(value);
    }
  }
  return files;
}

export async function POST(request: Request): Promise<NextResponse> {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const groupGuard = await requireCapability('config:write', request);
  if (!groupGuard.ok) return groupGuard.response;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError('Expected multipart/form-data', 400);
  }

  const excelFiles = filesFromForm(formData, CONFIG_UPLOAD_FIELD_NAMES.excel);
  const businessReviewFile = fileFromForm(formData, CONFIG_UPLOAD_FIELD_NAMES.businessReview);
  const executiveSummaryFile = fileFromForm(
    formData,
    CONFIG_UPLOAD_FIELD_NAMES.executiveSummary,
  );
  const mode =
    (formData.get('mode') as string | null) === 'deterministic' ? 'deterministic' : 'ai';
  const model = (formData.get('model') as string | null) || undefined;

  const validationErrors = [
    ...excelFiles.map((f) => validateExcelUpload(f)),
    validateMarkdownUpload(businessReviewFile, 'Business Review'),
    validateMarkdownUpload(executiveSummaryFile, 'Executive Summary'),
  ].filter((e): e is string => e != null);

  if (validationErrors.length > 0) {
    return jsonError(validationErrors.join('; '), 400);
  }

  if (excelFiles.length === 0 && !businessReviewFile && !executiveSummaryFile) {
    return jsonError('Select at least one source file to upload', 400);
  }

  try {
    const overrides: {
      excel?: Buffer[];
      businessReview?: string;
      executiveSummary?: string;
    } = {};

    const uploaded: SourceFileKey[] = [];

    if (excelFiles.length > 0) {
      for (const f of excelFiles) {
        if (f.size > MAX_EXCEL_BYTES) {
          return jsonError(`Workbook "${f.name}" exceeds size limit`, 400);
        }
      }
      overrides.excel = await Promise.all(
        excelFiles.map((f) => f.arrayBuffer().then((buf) => Buffer.from(buf))),
      );
      uploaded.push('excel');
    }

    if (businessReviewFile) {
      if (businessReviewFile.size > MAX_MARKDOWN_BYTES) {
        return jsonError('Business Review exceeds size limit', 400);
      }
      overrides.businessReview = await businessReviewFile.text();
      uploaded.push('businessReview');
    }

    if (executiveSummaryFile) {
      if (executiveSummaryFile.size > MAX_MARKDOWN_BYTES) {
        return jsonError('Executive Summary exceeds size limit', 400);
      }
      overrides.executiveSummary = await executiveSummaryFile.text();
      uploaded.push('executiveSummary');
    }

    if (mode === 'ai' && overrides.excel && overrides.excel.length > 0) {
      // ── AI + deterministic: always seed projections from the workbook parser
      // so /ops-tracking is populated even if the durable AI workflow is slow
      // or truncates wide sheets. AI may later enrich/overwrite via ON CONFLICT.
      const baseSeed = await seedFromSources({
        overrides,
        persistOverrides: true,
        skipFinancialProjections: false,
      });

      const input: WorkbookIngestInput = {
        files: overrides.excel.map((buf) => ({
          name: 'workbook.xlsx',
          data: new Uint8Array(buf),
          size: buf.byteLength,
        })),
        model: model ?? 'gpt-4o',
        skipContentGeneration: false,
        tenantSlug: process.env.NEXT_PUBLIC_TENANT_SLUG || undefined,
        appId: process.env.NEXT_PUBLIC_APP_ID?.trim() || '',
        dbUrl: process.env.POSTGRES_URL || '',
        openaiApiKey: (await resolveOpenAiKey()) || process.env.OPENAI_API_KEY || null,
      };

      const run = await start(handleWorkbookIngest, [input]);

      const payload = {
        ok: true,
        runId: run.runId,
        status: 'accepted',
        counts: baseSeed.counts,
        filesUsed: baseSeed.filesUsed,
        uploaded,
        appId: process.env.NEXT_PUBLIC_APP_ID?.trim() || '',
        warnings: [] as string[],
      };

      return NextResponse.json(payload, { status: 202 });
    }

    // ── Deterministic mode (or no Excel uploaded) ────────────
    const result = await seedFromSources({
      overrides,
      persistOverrides: true,
    });

    const payload: ReseedResponse = {
      counts: result.counts,
      filesUsed: result.filesUsed,
      uploaded,
      aiPipeline: { success: false, skipped: true, model: model ?? 'gpt-4o', projectionsCount: 0, pagesCreated: [], contentGenerated: false },
    };

    return jsonOk(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Seed failed';
    return jsonError(message, 500);
  }
}
