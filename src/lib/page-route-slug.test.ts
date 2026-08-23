import { describe, it, expect } from 'vitest';
import {
  parseReviewPartEditSlug,
  reviewPartEditSlug,
  routePathToPageSlug,
  isReviewPartEditSlug,
} from '@/lib/page-route-slug';

describe('routePathToPageSlug', () => {
  it('maps / to home', () => {
    expect(routePathToPageSlug('/')).toBe('home');
  });

  it('maps single-segment pages', () => {
    expect(routePathToPageSlug('/dashboard')).toBe('dashboard');
    expect(routePathToPageSlug('/summary')).toBe('summary');
  });

  it('maps /review/part-a to review:part-a', () => {
    expect(routePathToPageSlug('/review/part-a')).toBe('review:part-a');
    expect(routePathToPageSlug('/review/part-b/')).toBe('review:part-b');
  });

  it('returns null for bare /review (redirect target, not a CMS page)', () => {
    expect(routePathToPageSlug('/review')).toBeNull();
  });

  it('returns null for excluded and multi-segment non-review paths', () => {
    expect(routePathToPageSlug('/admin')).toBeNull();
    expect(routePathToPageSlug('/settings/billing')).toBeNull();
    expect(routePathToPageSlug('/tasks/ama')).toBeNull();
  });
});

describe('review part edit slug helpers', () => {
  it('builds and parses review:part-a', () => {
    expect(reviewPartEditSlug('part-a')).toBe('review:part-a');
    expect(parseReviewPartEditSlug('review:part-a')).toBe('part-a');
    expect(isReviewPartEditSlug('review:part-a')).toBe(true);
    expect(isReviewPartEditSlug('dashboard')).toBe(false);
    expect(isReviewPartEditSlug(null)).toBe(false);
  });
});
