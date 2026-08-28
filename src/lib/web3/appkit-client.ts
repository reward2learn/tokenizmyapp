/**
 * Reown AppKit client for the TokenizMyApp factory (billing social wallet).
 *
 * Lazy-loaded on the client only. Account state mirrors into Redux via
 * store/wallet-watcher.ts. SIWX mapping is re-applied after readyPromise
 * (Correction A) so verifyMessage survives ReownAuthentication overrides.
 */
import type { AppKitNetwork } from '@reown/appkit/networks';
import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { applyFactorySiwxAfterReady } from '@/lib/web3/apply-factory-siwx';
import { getFactoryWeb3Config, type FactoryWeb3Config } from '@/lib/web3/factory-web3-config';
import { factorySiweConfig } from '@/lib/web3/siwe-config';
import { setWagmiConfig } from '@/lib/web3/wagmi-store';
import { SIWE_CHAIN_ID } from '@/lib/web3/crypto-billing-config';

type AppKitInstance = Awaited<ReturnType<typeof createAppKitInstance>>;
type AppKitNetworks = [AppKitNetwork, ...AppKitNetwork[]];

const SUPPORTED_CHAIN_IDS = [1, 137, 8453, 42_161, 10, 11_155_111] as const;

async function resolveNetworks(chainIds: number[]): Promise<AppKitNetworks> {
  const { mainnet, polygon, base, arbitrum, optimism, sepolia } = await import(
    '@reown/appkit/networks'
  );

  const byId = new Map<number, AppKitNetwork>([
    [1, mainnet],
    [137, polygon],
    [8453, base],
    [42_161, arbitrum],
    [10, optimism],
    [11_155_111, sepolia],
  ]);

  const resolved = chainIds
    .map((id) => {
      const network = byId.get(id);
      if (!network) {
        console.warn(`[web3] Unsupported chain ${id} — ignoring.`);
      }
      return network;
    })
    .filter((n): n is AppKitNetwork => Boolean(n));

  return resolved.length ? (resolved as AppKitNetworks) : [sepolia];
}

function factoryMetadata() {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_HOST?.trim() || 'https://tokenizmyapp.vercel.app';

  return {
    name: 'TokenizMyApp',
    description: 'Business app configuration and billing',
    url: origin,
    icons: [`${origin}/favicon.ico`],
  };
}

async function createAppKitInstance(config: FactoryWeb3Config) {
  const [{ createAppKit }, { WagmiAdapter }, networks] = await Promise.all([
    import('@reown/appkit'),
    import('@reown/appkit-adapter-wagmi'),
    resolveNetworks(config.chains),
  ]);

  const wantsSocial = config.connectMode !== 'injected';
  const socialOnly = config.connectMode === 'social';
  const defaultNetwork =
    networks.find((n) => n.id === SIWE_CHAIN_ID) ?? networks[0];

  const wagmiAdapter = new WagmiAdapter({ networks, projectId: config.projectId });
  setWagmiConfig(wagmiAdapter.wagmiConfig);

  const appkit = createAppKit({
    adapters: [wagmiAdapter],
    networks,
    defaultNetwork,
    projectId: config.projectId,
    metadata: factoryMetadata(),
    siweConfig: factorySiweConfig,
    // showWallets is legacy — AppKit 1.8.x reads enableWallets instead.
    enableWallets: !socialOnly,
    // Do NOT set enableEmbedded. That flag means "host <w3m-modal> yourself /
    // skip document.body append" — not "use Reown social embedded wallets".
    // With it true, open() flips modal state but never mounts the popup.
    allWallets: socialOnly ? 'HIDE' : 'SHOW',
    features: {
      socials: wantsSocial && config.socialProviders.length ? config.socialProviders : false,
      email: wantsSocial && config.emailLogin,
      // Required for social/email wallets (Google/Apple OAuth via Reown auth).
      reownAuthentication: wantsSocial,
      emailShowWallets: !socialOnly,
      swaps: false,
      // Needed so checkout can open FundWallet / OnRampProviders when USDC is short.
      onramp: true,
      analytics: true,
    },
    showWallets: !socialOnly,
    themeMode: 'light',
  });

  // createAppKit() returns before initialize() finishes. Social-only mode hides
  // the wallet list; Google/email only render once the AUTH connector exists.
  // Opening earlier → empty "Connect Wallet" shell while getWallets still 200s.
  // applyFactorySiwxAfterReady waits on readyPromise, then re-applies SIWX/socials.
  await applyFactorySiwxAfterReady(Promise.resolve(appkit));

  return appkit;
}

let instance: Promise<AppKitInstance> | null = null;

export function getAppKit(): Promise<AppKitInstance> | null {
  if (typeof window === 'undefined') return null;

  const config = getFactoryWeb3Config();
  if (!config.enabled) return null;

  if (!instance) {
    instance = createAppKitInstance(config).catch((err) => {
      instance = null;
      throw err;
    });
  }
  return instance;
}

/** Reset memoized instance — for tests only. */
export function resetAppKitForTests(): void {
  instance = null;
}
