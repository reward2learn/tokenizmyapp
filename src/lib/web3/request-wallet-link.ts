/**
 * Trigger SIWE to link the connected AppKit wallet to the factory JWT session.
 *
 * Used after social connect (Google/Apple) and as a manual retry from settings.
 */
import { linkFactoryWalletSession } from '@/lib/web3/factory-wallet-link';

export async function requestWalletLink(): Promise<void> {
  await linkFactoryWalletSession();
}
