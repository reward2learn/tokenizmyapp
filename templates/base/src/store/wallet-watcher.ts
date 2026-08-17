/**
 * Bridges Reown AppKit's account state into the Redux store.
 *
 * Runs outside React on purpose. AppKit exposes `subscribeAccount` /
 * `subscribeNetwork` as plain callbacks, so the sync belongs at store
 * construction rather than in a component effect: there is no render that
 * depends on it, no dependency array to get wrong, and the connection survives
 * every component that displays it unmounting. Components only ever read the
 * `wallet` slice.
 *
 * No-ops entirely on the server and whenever the wallet capability is off.
 */
import type { UnknownAction } from '@reduxjs/toolkit';
import {
  walletEnabled,
  walletConnected,
  walletDisconnected,
  walletError,
  type WalletState,
} from '@/store/wallet-slice';

/**
 * The store, described structurally rather than as `AppStore`.
 *
 * `AppStore` is inferred from `makeStore()`'s return value, and `makeStore()`
 * calls this function — importing the type would make the store's own type
 * depend on itself. This is also all the watcher actually needs.
 */
interface WalletStoreLike {
  dispatch: (action: UnknownAction) => unknown;
  getState: () => { wallet: WalletState };
}

let attached = false;

export function attachWalletWatcher(store: WalletStoreLike): void {
  if (typeof window === 'undefined') return;
  // makeStore() can run more than once in development (fast refresh); a second
  // set of subscriptions would double every dispatch.
  if (attached) return;
  attached = true;

  void (async () => {
    try {
      const { getAppKit } = await import('@/lib/web3/appkit-client');
      const pending = getAppKit();
      if (!pending) return;

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
      // A wallet that fails to initialize must not take the app with it — the
      // rest of the dashboard has nothing to do with it.
      attached = false;
      const message = err instanceof Error ? err.message : String(err);
      console.error('[web3] Failed to initialize the wallet:', message);
      store.dispatch(walletError(message));
    }
  })();
}

/** AppKit reports the chain on the network controller, not on the account. */
function readChainId(appkit: { getChainId: () => number | string | undefined }): number | null {
  const chainId = appkit.getChainId();
  return typeof chainId === 'number' ? chainId : null;
}
