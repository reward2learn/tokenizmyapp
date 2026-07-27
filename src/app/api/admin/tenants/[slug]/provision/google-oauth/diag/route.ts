/**
 * Diagnostic endpoint — checks Google Cloud provisioning env vars
 * GET /api/admin/tenants/[slug]/provision/google-oauth/diag
 */
import { NextResponse } from 'next/server';
import { requireWriteAuth } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const guard = await requireWriteAuth(request);
  if (!guard.ok) return guard.response;

  const saJson = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON;

  let saParseResult = 'not attempted';
  if (saJson) {
    try {
      const sa = JSON.parse(saJson);
      saParseResult = `parsed OK: client_email=${sa.client_email}, project_id=${sa.project_id}`;
    } catch (e) {
      saParseResult = `parse FAILED: ${e instanceof Error ? e.message : 'unknown'}`;
    }
  }

  // Also check the secrets table
  let secretTableResult = 'not checked';
  try {
    const { getSecretPlaintext } = await import('@/lib/secrets');
    const secret = await getSecretPlaintext('GOOGLE_CLOUD_SERVICE_ACCOUNT');
    if (secret) {
      try {
        const parsed = JSON.parse(secret);
        secretTableResult = `FOUND: client_email=${parsed.client_email}, key_len=${(parsed.private_key || '').length}`;
      } catch {
        secretTableResult = `FOUND but INVALID JSON (${secret.length} chars)`;
      }
    } else {
      secretTableResult = 'not found';
    }
  } catch (e) {
    secretTableResult = `check error: ${e instanceof Error ? e.message : '?'}`;
  }

  return NextResponse.json({
    env: {
      GOOGLE_CLOUD_CREATE_PROJECTS: process.env.GOOGLE_CLOUD_CREATE_PROJECTS || '(not set)',
      GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID || '(not set)',
      GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON: saJson ? `set (${saJson.length} chars)` : '(not set)',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '(not set)',
    },
    saParseResult,
    secretTableResult,
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
  });
}
