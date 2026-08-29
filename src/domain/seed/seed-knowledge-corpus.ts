/**
 * Gates the Red Ruby seed corpus so the platform factory app never injects
 * another tenant's business data into its own database.
 */
import { isPlatformApp } from '@shared/lib/config/tenant';
// @ts-ignore — JS fixture file, no declaration
import * as redRubyCorpus from '../../../fixtures/red-ruby/knowledge-base.js';

export type RedRubySeedCorpus = typeof redRubyCorpus;

/** True when Upload & Seed may write the Red Ruby fixture (tenant apps only). */
export function redRubySeedCorpusEnabled(): boolean {
  return !isPlatformApp();
}

/** Red Ruby fixture exports, or null on the platform app. */
export function getRedRubySeedCorpus(): RedRubySeedCorpus | null {
  return redRubySeedCorpusEnabled() ? redRubyCorpus : null;
}
