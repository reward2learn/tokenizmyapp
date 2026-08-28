/**
 * Correction A — re-apply factory SIWX mapping after AppKit init settles.
 *
 * Reown Cloud remote config can replace custom siweConfig callbacks with
 * ReownAuthentication defaults. Re-applying via mapToSIWX() is the durable fix.
 *
 * @see docs/google-oauth-appkit-setup.md Correction A
 */
import { getFactoryWeb3Config } from '@/lib/web3/factory-web3-config';
import { factorySiweClient, signalSiweAppReady } from '@/lib/web3/siwe-config';

/**
 * Wait for AppKit auth init, then re-apply factory SIWX callbacks.
 */
export async function applyFactorySiwxAfterReady(
  appKitPromise?: Promise<unknown>,
): Promise<void> {
  if (appKitPromise) {
    try {
      const appkit = await appKitPromise;
      const ready = (appkit as { readyPromise?: Promise<unknown> }).readyPromise;
      if (ready) await ready;
    } catch {
      // Fall through — short defer still re-applies SIWX mapping.
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 150));
  await applyFactorySiwxMapping();
  await applyFactorySocialFeatures();
}

async function applyFactorySiwxMapping(): Promise<void> {
  const { OptionsController, SIWXUtil, ChainController } = await import(
    '@reown/appkit-controllers'
  );

  OptionsController.setSIWX(factorySiweClient.mapToSIWX());
  signalSiweAppReady();

  const caipAddress = ChainController.getActiveCaipAddress();
  if (caipAddress) {
    await SIWXUtil.initializeIfEnabled(caipAddress);
  }
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
