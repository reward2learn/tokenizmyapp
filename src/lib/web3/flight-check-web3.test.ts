import { describe, expect, it } from 'vitest';
import {
  evaluateReownGoogleSocials,
  evaluateReownProjectIdForDeploy,
  evaluateSocialWalletTemplate,
} from '@/lib/web3/flight-check-web3';
import type { Web3WalletConfig } from '@/domain/tenant/template-catalog';

const SOCIAL_GOOGLE: Web3WalletConfig = {
  enabled: true,
  connectMode: 'social',
  socialProviders: ['google'],
  emailLogin: true,
  chains: [8453],
  showBalances: false,
  tokenGating: false,
};

describe('evaluateSocialWalletTemplate', () => {
  it('passes when social mode includes google', () => {
    const result = evaluateSocialWalletTemplate(SOCIAL_GOOGLE);
    expect(result.status).toBe('pass');
  });

  it('fails when wallet is disabled', () => {
    const result = evaluateSocialWalletTemplate({ ...SOCIAL_GOOGLE, enabled: false });
    expect(result.status).toBe('fail');
  });

  it('fails when connectMode is injected', () => {
    const result = evaluateSocialWalletTemplate({ ...SOCIAL_GOOGLE, connectMode: 'injected' });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('connectMode');
  });

  it('fails when google is not a social provider', () => {
    const result = evaluateSocialWalletTemplate({
      ...SOCIAL_GOOGLE,
      socialProviders: ['apple'],
    });
    expect(result.status).toBe('fail');
    expect(result.detail).toContain('google');
  });
});

describe('evaluateReownProjectIdForDeploy', () => {
  it('skips detail when wallet disabled', () => {
    const result = evaluateReownProjectIdForDeploy(false, 'abc123');
    expect(result.status).toBe('warn');
    expect(result.detail).toContain('N/A');
  });

  it('passes when wallet enabled and project id present', () => {
    const result = evaluateReownProjectIdForDeploy(true, '6f45b9fac8b302233f2cfce1ca0b7979');
    expect(result.status).toBe('pass');
    expect(result.detail).toContain('NEXT_PUBLIC_REOWN_PROJECT_ID');
  });
});

describe('evaluateReownGoogleSocials', () => {
  it('warns for manual Reown Cloud check when wallet enabled', () => {
    const result = evaluateReownGoogleSocials(true);
    expect(result.status).toBe('warn');
    expect(result.detail).toContain('dashboard.reown.com');
  });
});
