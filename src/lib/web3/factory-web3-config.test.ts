import { describe, expect, it, afterEach } from 'vitest';
import { getFactoryWeb3Config } from '@/lib/web3/factory-web3-config';
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';

describe('getFactoryWeb3Config', () => {
  const saved = { ...process.env };

  afterEach(() => {
    process.env = { ...saved };
  });

  it('is enabled in production with the platform project id fallback', () => {
    (process.env as any).NODE_ENV = 'production';
    delete process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED;
    delete process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED;
    expect(getFactoryWeb3Config().enabled).toBe(true);
  });

  it('is disabled when explicitly turned off', () => {
    (process.env as any).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED = 'false';
    expect(getFactoryWeb3Config().enabled).toBe(false);
  });

  it('enables when NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED is true', () => {
    (process.env as any).NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED = 'true';
    const config = getFactoryWeb3Config();
    expect(config.enabled).toBe(true);
    expect(config.chains[0]).toBe(SIWE_CHAIN_ID);
    expect(config.socialProviders).toContain('google');
  });

  it('is enabled in development with the platform project id fallback', () => {
    (process.env as any).NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_WEB3_WALLET_ENABLED;
    delete process.env.NEXT_PUBLIC_CRYPTO_PAYMENTS_ENABLED;
    expect(getFactoryWeb3Config().enabled).toBe(true);
  });
});
