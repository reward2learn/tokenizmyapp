/**
 * Bridges Reown AppKit account state into the Redux wallet slice.
 */
import type { UnknownAction } from '@reduxjs/toolkit';
import { isFactoryWeb3Enabled } from '@/lib/web3/factory-web3-config';
import {
  walletEnabled,
  walletConnected,
  walletDisconnected,
  walletError,
  type WalletState,
} from '@/store/wallet-slice';

interface WalletStoreLike {
  dispatch: (action: UnknownAction) => unknown;
  getState: () => { wallet: WalletState };
}

let attached = false;

export function attachWalletWatcher(store: WalletStoreLike): void {
  if (typeof window === 'undefined') return;
  if (attached) return;
  attached = true;

  void (async () => {
    try {
      if (!isFactoryWeb3Enabled()) {
        attached = false;
        return;
      }

      const { getAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      if (!pending) {
        attached = false;
        store.dispatch(walletError('Social wallet is not configured for this deployment.'));
        return;
      }

      const appkit = await pending;
      store.dispatch(walletEnabled());

      appkit.subscribeAccount((account) => {
        if (account.isConnected && account.address) {
          store.dispatch(
            walletConnected({
              address: account.address,
              chainId: readChainId(appkit),
              connectorId: account.embeddedWalletInfo?.authProvider ?? null,
            }),
          );
        } else {
          store.dispatch(walletDisconnected());
        }
      });

      appkit.subscribeNetwork((network) => {
        const state = store.getState().wallet;
        if (state.status !== 'connected' || !state.address) return;
        store.dispatch(
          walletConnected({
            address: state.address,
            chainId: typeof network.chainId === 'number' ? network.chainId : null,
            connectorId: state.connectorId,
          }),
        );
      });
    } catch (err) {
      attached = false;
      const message = err instanceof Error ? err.message : String(err);
      console.error('[web3] Failed to initialize the wallet:', message);
      store.dispatch(walletError(message));
    }
  })();
}

function readChainId(appkit: { getChainId: () => number | string | undefined }): number | null {
  const chainId = appkit.getChainId();
  return typeof chainId === 'number' ? chainId : null;
}

/** Reset attachment guard — for tests only. */
export function resetWalletWatcherForTests(): void {
  attached = false;
}
