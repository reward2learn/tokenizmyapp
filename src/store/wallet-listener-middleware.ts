import { createListenerMiddleware } from '@reduxjs/toolkit';
import { sessionWalletMatches } from '@/lib/auth/wallet-session';
import { clearAuthSuccessRedirect, isSocialWalletConnection } from '@/lib/web3/social-wallet-connectors';
import { setSession } from '@/store/auth-slice';
import { authApi } from '@/store/apis/auth-api';
import {
  disconnectWalletSession,
  linkWalletSession,
  walletAuthRedirectCleared,
  walletConnected,
  walletLinkConfirmed,
  walletSessionLinked,
} from '@/store/wallet-slice';

type ListenerApi = {
  getState: () => {
    auth: { tier: string; bootstrapped: boolean; walletAddress?: string | null };
    wallet: {
      status: string;
      address: string | null;
      connectorId: string | null;
      linkStatus: string;
      lastLinkAttemptAddress: string | null;
      authRedirectPending: boolean;
    };
  };
  dispatch: (action: unknown) => unknown;
  cancelActiveListeners: () => void;
};

export const walletListener = createListenerMiddleware();

function shouldAutoLinkWallet(state: ReturnType<ListenerApi['getState']>): boolean {
  const { auth, wallet } = state;

  if (!auth.bootstrapped || auth.tier === 'public') return false;
  if (wallet.status !== 'connected' || !wallet.address) return false;
  if (!isSocialWalletConnection(wallet.connectorId)) return false;
  if (walletSessionLinked(auth, wallet.address)) return false;
  if (wallet.linkStatus === 'linking') return false;

  const addressKey = wallet.address.toLowerCase();
  if (wallet.authRedirectPending) return true;
  if (wallet.lastLinkAttemptAddress === addressKey) return false;

  return true;
}

async function maybeLinkSocialWallet(listenerApi: ListenerApi): Promise<void> {
  if (!shouldAutoLinkWallet(listenerApi.getState())) return;
  listenerApi.cancelActiveListeners();
  await listenerApi.dispatch(linkWalletSession());
}

/** Social wallet connected — link factory JWT when session lacks walletAddress. */
walletListener.startListening({
  actionCreator: walletConnected,
  effect: async (_action, listenerApi) => {
    await maybeLinkSocialWallet(listenerApi as ListenerApi);
  },
});

/** Session hydrated — link if wallet was already connected (e.g. page refresh). */
walletListener.startListening({
  actionCreator: setSession,
  effect: async (action, listenerApi) => {
    if (action.payload.tier === 'public') return;
    await maybeLinkSocialWallet(listenerApi as ListenerApi);
  },
});

/** Session refetched — mark linked when JWT already carries walletAddress. */
walletListener.startListening({
  matcher: authApi.endpoints.getSession.matchFulfilled,
  effect: (action, listenerApi) => {
    const walletAddress = action.payload.data?.walletAddress;
    const { wallet } = (listenerApi as ListenerApi).getState();
    if (
      walletAddress
      && wallet.address
      && sessionWalletMatches({ walletAddress, sub: '', tier: '' } as any, wallet.address)
      && wallet.linkStatus !== 'linked'
    ) {
      listenerApi.dispatch(walletLinkConfirmed());
    }
  },
});

/** After successful link — refresh session cookie claims in Redux. */
walletListener.startListening({
  actionCreator: linkWalletSession.fulfilled,
  effect: async (_action, listenerApi) => {
    clearAuthSuccessRedirect();
    listenerApi.dispatch(walletAuthRedirectCleared());
    listenerApi.dispatch(authApi.util.invalidateTags(['Session']));
    await listenerApi.dispatch(
      authApi.endpoints.getSession.initiate(undefined, { forceRefetch: true }),
    );
  },
});

/** After disconnect — clear wallet claims from JWT and Redux auth. */
walletListener.startListening({
  actionCreator: disconnectWalletSession.fulfilled,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(authApi.util.invalidateTags(['Session']));
    await listenerApi.dispatch(
      authApi.endpoints.getSession.initiate(undefined, { forceRefetch: true }),
    );
  },
});

export const walletListenerMiddleware = walletListener.middleware;
