/**
 * Re-apply factory social features after AppKit init settles.
 *
 * Previously this also called OptionsController.setSIWX() to override the
 * factory SIWE config globally. That caused ReownAuthentication to use the
 * factory nonce format (hex) instead of JWT, resulting in 401s from the
 * Reown Cloud API. Factory SIWE link now goes through linkFactoryWalletSession
 * (direct nonce→sign→verify), so no global SIWX override is needed.
 *
 * @see docs/factory-reown-siwe-wallet-link.md
 * @see docs/google-oauth-appkit-setup.md
 */
import { getFactoryWeb3Config } from '@/lib/web3/factory-web3-config';
import { signalSiweAppReady } from '@/lib/web3/siwe-config';

/**
 * Race a promise against a timeout to prevent indefinite hangs.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`[siwx] ${label} timed out after ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/**
 * Wait for AppKit auth init, then re-apply factory social features.
 * Does NOT override SIWX — factory SIWE link goes through linkFactoryWalletSession.
 */
export async function applyFactorySocialFeaturesAfterReady(
  appKitPromise?: Promise<unknown>,
): Promise<void> {
  if (appKitPromise) {
    try {
      const appkit = await appKitPromise;
      console.log('[siwx] appkit resolved in applyFactorySocialFeaturesAfterReady');
      const ready = (appkit as { readyPromise?: Promise<unknown> }).readyPromise;
      if (ready) {
        console.log('[siwx] waiting on readyPromise...');
        // Guard against readyPromise hanging (stale IndexedDB session, etc.)
        await withTimeout(ready, 12_000, 'readyPromise');
        console.log('[siwx] readyPromise resolved');
      } else {
        console.log('[siwx] no readyPromise found');
      }
    } catch (err) {
      console.error('[siwx] error waiting for ready:', err);
      // Fall through — short defer still re-applies social features.
    }
  }
  console.log('[siwx] sleeping 150ms...');
  await new Promise((resolve) => setTimeout(resolve, 150));
  // Signal readiness so linkFactoryWalletSession (waitForSiweAppReady) can proceed.
  console.log('[siwx] signaling siweAppReady...');
  signalSiweAppReady();
  console.log('[siwx] applying social features...');
  await applyFactorySocialFeatures();
  console.log('[siwx] applyFactorySocialFeaturesAfterReady complete');
}

/**
 * Re-assert factory social-login options after Reown Cloud remote config loads.
 * Cloud can disable social_login for the project — the factory billing flow requires Google.
 */
async function applyFactorySocialFeatures(): Promise<void> {
  const config = getFactoryWeb3Config();
  if (!config.enabled || config.connectMode === 'injected') return;

  const socialOnly = config.connectMode === 'social';
  const { OptionsController } = await import('@reown/appkit-controllers');

  OptionsController.setEnableWallets(!socialOnly);
  // Keep enableEmbedded false so AppKit appends <w3m-modal> to document.body.
  // Social wallets are gated by features.reownAuthentication + socials, not this flag.
  OptionsController.setEnableEmbedded(false);
  OptionsController.setAllWallets(socialOnly ? 'HIDE' : 'SHOW');
  OptionsController.setFeatures({
    socials: config.socialProviders.length ? config.socialProviders : false,
    email: config.emailLogin,
    reownAuthentication: true,
    emailShowWallets: !socialOnly,
  });

  if (config.socialProviders.length) {
    OptionsController.setRemoteFeatures({
      socials: config.socialProviders,
      email: config.emailLogin,
      reownAuthentication: true,
    });
  }
}
