/**
 * GET /api/ollama/v1/models — OpenAI-compatible models list (canonical).
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
