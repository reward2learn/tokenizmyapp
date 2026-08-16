/**
 * Response helpers that avoid importing `next/server` — safe for the
 * `@workflow/vitest` ESM step bundle. Functionally equivalent to
 * `jsonError` in `./response.ts` (same JSON shape, same status).
 */
export function jsonErrorLite(error: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}