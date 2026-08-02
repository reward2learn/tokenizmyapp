/**
 * Progress emission for the app-pack-generate workflow.
 *
 * Follows the SDK streaming pattern used by workbook-ingest: the workflow
 * function calls `getWritable()` and passes the stream to steps; steps obtain
 * a writer, write JSON chunks, and release the lock.
 */
import type { ProgressChunk } from './types';

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

export async function closeProgressStream(
  writable: WritableStream<ProgressChunk | string>,
): Promise<void> {
  await writable.close();
}
