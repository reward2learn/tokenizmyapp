/**
 * Bridges Reown AppKit account state into the Redux wallet slice.
 */
import type { UnknownAction } from '@reduxjs/toolkit';
import { isFactoryWeb3Enabled } from '@/lib/web3/factory-web3-config';
import { normalizeChainId } from '@/lib/web3/normalize-chain-id';
import {
  walletEnabled,
  walletConnected,
  walletConnectCancelled,
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

      // subscribeAccount only fires on *changes* — if AppKit restored a session
      // from IndexedDB before the subscription was registered, the initial
      // "connected" event was missed.  Sync once to close that race window.
      const initialAccount = appkit.getAccount?.();
      if (initialAccount?.isConnected && initialAccount.address) {
        store.dispatch(
          walletConnected({
            address: initialAccount.address,
            chainId: readChainId(appkit),
            connectorId: initialAccount.embeddedWalletInfo?.authProvider ?? null,
          }),
        );
      }

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

      // subscribeAccount only fires on changes — closing the modal without connecting
      // leaves Redux stuck on "connecting" unless we watch modal open/close.
      appkit.subscribeState((modalState) => {
        const wallet = store.getState().wallet;
        if (modalState.open) {
          // Modal visible — keep "connecting" until account or close.
          return;
        }
        if (wallet.status !== 'connecting') return;
        const account = appkit.getAccount();
        if (account?.isConnected && account.address) {
          store.dispatch(
            walletConnected({
              address: account.address,
              chainId: readChainId(appkit),
              connectorId: account.embeddedWalletInfo?.authProvider ?? null,
            }),
          );
          return;
        }
        store.dispatch(walletConnectCancelled());
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
  return normalizeChainId(appkit.getChainId());
}

/** Reset attachment guard — for tests only. */
export function resetWalletWatcherForTests(): void {
  attached = false;
}
