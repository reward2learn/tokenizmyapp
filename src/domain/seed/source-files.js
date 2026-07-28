import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
export const SOURCE_FILENAMES = {
    excel: 'red-ruby-cashflow.xlsx',
    businessReview: 'business-review.md',
    executiveSummary: 'executive-summary.md',
};
const WEBSITE_ROOT = resolve(process.cwd());
const DEFAULT_REPO_ROOT = resolve(WEBSITE_ROOT, '..');
export function getWebsiteRoot() {
    return WEBSITE_ROOT;
}
export function getDefaultRepoRoot() {
    return DEFAULT_REPO_ROOT;
}
/** Directory for persisted source files (repo root locally, /tmp on Vercel unless overridden). */
export function getSourceDir(_required) {
    if (process.env.REDRUBY_SOURCE_DIR) {
        return resolve(process.env.REDRUBY_SOURCE_DIR);
    }
    // Excel is optional — markdown-only uploads (Business Review / Executive Summary) are supported.
    // Never throw here; resolveSources() validates that at least one source is present.
    return DEFAULT_REPO_ROOT;
}
export function sourceFilePath(key, sourceDir = getSourceDir()) {
    const filename = SOURCE_FILENAMES[key];
    const resolvedDir = resolve(sourceDir);
    const resolvedPath = resolve(resolvedDir, filename);
    if (!resolvedPath.startsWith(resolvedDir)) {
        throw new Error('Invalid source file path');
    }
    return resolvedPath;
}
export function ensureSourceDir(sourceDir = getSourceDir()) {
    const dir = resolve(sourceDir);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}
export function readSourceFile(key, sourceDir = getSourceDir()) {
    const path = sourceFilePath(key, sourceDir);
    if (!existsSync(path)) {
        throw new Error(`Missing source file: ${basename(path)}`);
    }
    return readFileSync(path);
}
export function readSourceText(key, sourceDir = getSourceDir()) {
    return readSourceFile(key, sourceDir).toString('utf8');
}
export function writeSourceFile(key, data, sourceDir = getSourceDir()) {
    const dir = ensureSourceDir(sourceDir);
    const path = sourceFilePath(key, dir);
    const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    writeFileSync(path, buffer);
    return path;
}
export function sourceFileExists(key, sourceDir = getSourceDir()) {
    return existsSync(sourceFilePath(key, sourceDir));
}
export const TERMS_HTML_PATH = resolve(WEBSITE_ROOT, 'terms-of-service.html');
export const PRIVACY_HTML_PATH = resolve(WEBSITE_ROOT, 'privacy-policy.html');
