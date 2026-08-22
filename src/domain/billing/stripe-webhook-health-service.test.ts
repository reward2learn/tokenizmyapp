import { describe, expect, it } from 'vitest';
import {
  eventsCoverRequired,
  REQUIRED_SNAPSHOT_WEBHOOK_EVENTS,
} from './stripe-webhook-health-service';

describe('eventsCoverRequired', () => {
  it('passes when all required events are subscribed', () => {
    const result = eventsCoverRequired(
      [...REQUIRED_SNAPSHOT_WEBHOOK_EVENTS],
      REQUIRED_SNAPSHOT_WEBHOOK_EVENTS,
    );
    expect(result.ok).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it('passes when wildcard is enabled', () => {
    const result = eventsCoverRequired(['*'], REQUIRED_SNAPSHOT_WEBHOOK_EVENTS);
    expect(result.ok).toBe(true);
  });

  it('lists missing events', () => {
    const result = eventsCoverRequired(
      ['customer.subscription.updated'],
      REQUIRED_SNAPSHOT_WEBHOOK_EVENTS,
    );
    expect(result.ok).toBe(false);
    expect(result.missing).toContain('checkout.session.completed');
    expect(result.missing).toContain('invoice.paid');
  });
});
