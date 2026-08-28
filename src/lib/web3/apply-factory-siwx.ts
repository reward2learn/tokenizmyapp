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
 *
 * AppKit 1.8.x does not expose readyPromise on the public type; a short defer
 * matches the production PRESTIX pattern of re-applying after init completes.
 */
export async function applyFactorySiwxAfterReady(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
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
