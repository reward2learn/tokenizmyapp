/**
 * Reown AppKit client — the app's single wallet instance.
 *
 * Deliberately NOT a React provider. `createAppKit()` mounts its own `<w3m-modal>`
 * web component into document.body and exposes `subscribeAccount` /
 * `subscribeNetwork` outside React, so wrapping the tree in a context would add
 * a provider that owns nothing. The account state is mirrored into Redux by
 * store/wallet-watcher.ts and read from there like any other slice.
 *
 * Everything here is client-only and lazy: nothing imports @reown/appkit at
 * module scope, so a deployment with the wallet switched off never pulls the
 * SDK into a bundle it loads.
 */
import type { AppKitNetwork } from '@reown/appkit/networks';
import { getWeb3Config, type Web3RuntimeConfig } from '@/lib/config/web3';
import { getTenantConfig, getTenantAppUrl } from '@shared/lib/config/tenant';

type AppKitInstance = Awaited<ReturnType<typeof createAppKitInstance>>;

/** AppKit requires at least one network — its option is a non-empty tuple. */
type AppKitNetworks = [AppKitNetwork, ...AppKitNetwork[]];

/** Chains the app is willing to run on, keyed by EVM chain id. */
const SUPPORTED_CHAIN_IDS = [1, 137, 8453, 42161, 10] as const;

/**
 * Resolve viem chain definitions for the configured chain ids.
 *
 * Imported by name rather than star-importing `@reown/appkit/networks`, which
 * re-exports the whole of `viem/chains` — several hundred definitions that
 * would all land in the bundle.
 */
async function resolveNetworks(chainIds: number[]): Promise<AppKitNetworks> {
  const { mainnet, polygon, base, arbitrum, optimism } = await import('@reown/appkit/networks');

  // Typed as AppKitNetwork rather than inferred: viem's chain definitions are
  // `as const` object literals, so inference would pin the map to whichever
  // chain appeared first and reject the rest.
  const byId = new Map<number, AppKitNetwork>([
    [1, mainnet],
    [137, polygon],
    [8453, base],
    [42161, arbitrum],
    [10, optimism],
  ]);

  const resolved = chainIds
    .map((id) => {
      const network = byId.get(id);
      if (!network) {
        console.warn(
          `[web3] Chain ${id} is not in the supported set (${SUPPORTED_CHAIN_IDS.join(', ')}) — ignoring it.`,
        );
      }
      return network;
    })
    .filter((n): n is AppKitNetwork => Boolean(n));

  // AppKit's `networks` option is a non-empty tuple. Base is the fallback for
  // the same reason it is the default: cheap enough that gas never becomes the
  // tenant's problem to explain.
  return resolved.length ? (resolved as AppKitNetworks) : [base];
}

async function createAppKitInstance(config: Web3RuntimeConfig) {
  const [{ createAppKit }, { WagmiAdapter }, networks] = await Promise.all([
    import('@reown/appkit'),
    import('@reown/appkit-adapter-wagmi'),
    resolveNetworks(config.chains),
  ]);

  const tenant = getTenantConfig();

  // `injected` means browser-extension wallets only, so socials and email are
  // switched off for it; `both` offers everything. Passing socials when the
  // mode excludes them would render buttons that contradict the template.
  const wantsSocial = config.connectMode !== 'injected';

  return createAppKit({
    adapters: [new WagmiAdapter({ networks, projectId: config.projectId })],
    networks,
    projectId: config.projectId,
    metadata: {
      name: tenant.appTitle,
      description: tenant.description,
      url: getTenantAppUrl(),
      // AppKit requires at least one icon; the app's own favicon keeps the
      // connect sheet branded as the tenant rather than as the platform.
      icons: [`${getTenantAppUrl()}/favicon.ico`],
    },
    features: {
      socials: wantsSocial && config.socialProviders.length ? config.socialProviders : false,
      email: wantsSocial && config.emailLogin,
      // Swaps and on-ramp are payment flows. They stay off unless a tenant
      // explicitly asks: turning them on silently would put a money-movement
      // surface into a business app that never requested one.
      swaps: false,
      onramp: false,
      analytics: true,
    },
    // Extension wallets are hidden in social-only mode so the sheet shows the
    // familiar sign-in buttons instead of a wallet list the audience does not have.
    showWallets: config.connectMode !== 'social',
    themeMode: 'light',
  });
}

let instance: Promise<AppKitInstance> | null = null;

/**
 * The AppKit instance for this app, or null when the wallet is not configured.
 *
 * Memoized on the promise, not the resolved value, so two callers racing on
 * first use share one initialization — AppKit mounts DOM and registers global
 * listeners, and creating it twice leaves two modals on the page.
 */
export function getAppKit(): Promise<AppKitInstance> | null {
  if (typeof window === 'undefined') return null;

  const config = getWeb3Config();
  if (!config.enabled) return null;

  if (!instance) {
    instance = createAppKitInstance(config).catch((err) => {
      // Reset so a transient failure (a chunk that failed to load) can be
      // retried on the next click rather than wedging the wallet for the session.
      instance = null;
      throw err;
    });
  }
  return instance;
}
