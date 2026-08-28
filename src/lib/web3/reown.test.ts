import { describe, expect, it, afterEach } from 'vitest';
import {
  buildWeb3EnvVars,
  resolveReownProjectId,
  DEFAULT_REOWN_PROJECT_ID,
  DEFAULT_WEB3_WALLET,
} from '@/lib/web3/reown';
import type { Web3WalletConfig } from '@/domain/tenant/template-catalog';

const ENABLED: Web3WalletConfig = {
  enabled: true,
  connectMode: 'social',
  socialProviders: ['google', 'apple'],
  emailLogin: true,
  chains: [8453, 1],
  showBalances: true,
  tokenGating: false,
};

describe('buildWeb3EnvVars', () => {
  it('maps an enabled wallet onto the runtime env contract', () => {
    expect(buildWeb3EnvVars(ENABLED)).toEqual({
      NEXT_PUBLIC_WEB3_WALLET_ENABLED: 'true',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'true',
      NEXT_PUBLIC_REOWN_PROJECT_ID: resolveReownProjectId(),
      NEXT_PUBLIC_WEB3_CONNECT_MODE: 'social',
      NEXT_PUBLIC_WEB3_SOCIALS: 'google,apple',
      NEXT_PUBLIC_WEB3_EMAIL_LOGIN: 'true',
      NEXT_PUBLIC_WEB3_CHAINS: '8453,1',
      NEXT_PUBLIC_WEB3_SHOW_BALANCES: 'true',
      NEXT_PUBLIC_WEB3_TOKEN_GATING: 'false',
    });
  });

  it('writes the disable flag rather than omitting it', () => {
    // Vercel env vars persist across deploys: omitting the key for a disabled
    // wallet would leave a previously-enabled app with a wallet forever.
    expect(buildWeb3EnvVars({ ...ENABLED, enabled: false })).toEqual({
      NEXT_PUBLIC_WEB3_WALLET_ENABLED: 'false',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'false',
    });
  });

  it('treats a template with no wallet capability as enabled by default', () => {
    expect(buildWeb3EnvVars(undefined)).toEqual({
      NEXT_PUBLIC_WEB3_WALLET_ENABLED: 'true',
      NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED: 'true',
      NEXT_PUBLIC_REOWN_PROJECT_ID: resolveReownProjectId(),
      NEXT_PUBLIC_WEB3_CONNECT_MODE: 'social',
      NEXT_PUBLIC_WEB3_SOCIALS: 'google,apple',
      NEXT_PUBLIC_WEB3_EMAIL_LOGIN: 'true',
      NEXT_PUBLIC_WEB3_CHAINS: '8453',
      NEXT_PUBLIC_WEB3_SHOW_BALANCES: 'false',
      NEXT_PUBLIC_WEB3_TOKEN_GATING: 'false',
    });
    expect(buildWeb3EnvVars(null)).toEqual(buildWeb3EnvVars(undefined));
  });

  it('ships with the wallet on by default', () => {
    expect(DEFAULT_WEB3_WALLET.enabled).toBe(true);
  });
});

describe('resolveReownProjectId', () => {
  const original = process.env.REOWN_PROJECT_ID;

  afterEach(() => {
    if (original === undefined) delete process.env.REOWN_PROJECT_ID;
    else process.env.REOWN_PROJECT_ID = original;
  });

  it('falls back to the platform project id', () => {
    delete process.env.REOWN_PROJECT_ID;
    expect(resolveReownProjectId()).toBe(
      process.env.NEXT_PUBLIC_REOWN_PROJECT_ID?.trim() || DEFAULT_REOWN_PROJECT_ID,
    );
  });

  it('prefers an explicitly configured project id', () => {
    process.env.REOWN_PROJECT_ID = 'staging-project-id';
    expect(resolveReownProjectId()).toBe('staging-project-id');
  });
});
