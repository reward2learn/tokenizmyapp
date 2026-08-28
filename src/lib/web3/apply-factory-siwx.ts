/**
 * Correction A — re-apply factory SIWX mapping after AppKit init settles.
 *
 * Reown Cloud remote config can replace custom siweConfig callbacks with
 * ReownAuthentication defaults. Re-applying via mapToSIWX() is the durable fix.
 *
 * @see docs/google-oauth-appkit-setup.md Correction A
 */
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
