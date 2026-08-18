import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CreditUsageTable } from '@/components/billing/credit-usage-table';
import type { CreditLedgerEntry } from '@/store/apis/organization-api';

afterEach(cleanup);

function entry(over: Partial<CreditLedgerEntry>): CreditLedgerEntry {
  return {
    id: Math.random().toString(36).slice(2),
    orgId: 'org_1',
    grantId: null,
    delta: -5,
    reason: 'ai_generation',
    refType: null,
    refId: null,
    createdAt: new Date().toISOString(),
    metadata: null,
    ...over,
  };
}

describe('CreditUsageTable', () => {
  it('reads both token naming conventions', () => {
    // The metering call has used prompt/completion and input/output at
    // different times. Showing a dash for half the rows because one convention
    // was assumed is exactly the failure this table exists to avoid.
    render(
      <CreditUsageTable
        ledger={[
          entry({ metadata: { model: 'a', inputTokens: 100, outputTokens: 20 } }),
          entry({ metadata: { model: 'b', promptTokens: 300, completionTokens: 40 } }),
        ]}
      />,
    );
    expect(screen.getByText('100 in / 20 out')).toBeInTheDocument();
    expect(screen.getByText('300 in / 40 out')).toBeInTheDocument();
  });

  it('survives metadata that is missing or the wrong shape', () => {
    // `metadata` is `unknown` on the wire. A row must degrade to a dash rather
    // than throw inside a table cell and blank the whole panel.
    render(
      <CreditUsageTable
        ledger={[entry({ metadata: null }), entry({ metadata: 'not an object' })]}
      />,
    );
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('separates an exempt run from a zero charge', () => {
    // Zero delta is not a rounding artefact — it is work done under an
    // exemption, recorded so it stays visible. Rendering it as "0" would read
    // as a free generation rather than a waived one.
    render(<CreditUsageTable ledger={[entry({ delta: 0, reason: 'ai_generation_exempt' })]} />);
    expect(screen.getByText('Exempt')).toBeInTheDocument();
  });

  it('filters to spend only', () => {
    render(
      <CreditUsageTable
        ledger={[
          entry({ delta: -5, reason: 'ai_generation' }),
          entry({ delta: 50, reason: 'plan_allowance' }),
        ]}
      />,
    );
    fireEvent.mouseDown(screen.getByRole('combobox', { name: /Direction/i }));
    fireEvent.click(screen.getByRole('option', { name: 'Spend' }));
    expect(screen.getByText('1 of 2 shown · 5 credits spent in this view')).toBeInTheDocument();
  });

  it('says so when there is nothing rather than rendering an empty table', () => {
    render(<CreditUsageTable ledger={[]} />);
    expect(screen.getByText(/No usage yet/i)).toBeInTheDocument();
  });
});
