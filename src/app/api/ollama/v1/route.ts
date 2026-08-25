/**
 * GET /api/ollama/v1 — OpenAI-compatible models list (alias).
 *
 * The AI Providers "Models URL" field is used as-is (no `/models` appended),
 * so tenants that set `…/api/ollama/v1` still get a valid catalog.
 */
import { NextResponse } from 'next/server';
import {
  assertOllamaProxyAuthorized,
  curatedModelsOpenAiPayload,
} from '@/lib/ollama-proxy';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  if (!assertOllamaProxyAuthorized(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(curatedModelsOpenAiPayload(false));
}
