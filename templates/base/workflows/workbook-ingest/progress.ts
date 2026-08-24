/**
 * Progress emission for the workbook-ingest workflow.
 *
 * Follows the SDK streaming pattern:
 *   - the workflow function calls `getWritable()` and passes the stream to steps;
 *   - steps obtain a writer, write JSON chunks, and release the lock.
 *
 * The writable stream is serialized by reference across step boundaries
 * (streamToStreamRef), so we always pass the raw WritableStream — never a
 * wrapper object.
 */
import type { ProgressChunk } from './types';

/**
 * Encode a progress chunk as a JSON string (chunks are written as text).
 */
export function encodeChunk(chunk: ProgressChunk): string {
  return JSON.stringify(chunk);
}

/**
 * Write one progress chunk. Call from within a step:
 *
 *   async function emitProgressStep(writable: WritableStream, chunk: ProgressChunk) {
 *     'use step';
 *     await writeProgressChunk(writable, chunk);
 *   }
 */
export async function writeProgressChunk(
  writable: WritableStream<ProgressChunk | string>,
  chunk: ProgressChunk,
): Promise<void> {
  const writer = writable.getWriter();
  try {
    await writer.write(chunk);
  } finally {
    writer.releaseLock();
  }
}

/** Close the stream to signal completion. Call from within a step. */
export async function closeProgressStream(
  writable: WritableStream<ProgressChunk | string>,
): Promise<void> {
  await writable.close();
}
