/**
 * Race a promise against a timeout, rejecting with a clear, labeled error
 * instead of letting the caller hang indefinitely.
 *
 * Doesn't cancel the underlying operation (a Prisma query can't be aborted
 * mid-flight) — it lets the CALLING request move on and fail fast instead
 * of silently consuming the full serverless function timeout. Diagnosed via
 * a real production incident: /api/admin/ai-content timed out at 120s with
 * zero outgoing HTTP requests logged — Postgres queries over the wire
 * protocol don't show up as "External APIs" in Vercel's request trace, so a
 * single stuck DB call there was indistinguishable from any other hang.
 * Wrapping each DB call turns that into a fast, labeled failure that
 * pinpoints exactly which call got stuck.
 */
export async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}
