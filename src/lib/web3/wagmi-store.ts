/**
 * Shared wagmi Config from the AppKit WagmiAdapter — used for USDC transfers.
 *
 * Set once when AppKit initializes; read by crypto top-up UI via wagmi/actions.
 */
import type { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

type WagmiConfig = WagmiAdapter['wagmiConfig'];

let wagmiConfig: WagmiConfig | null = null;

export function setWagmiConfig(config: WagmiConfig): void {
  wagmiConfig = config;
}

export function getWagmiConfig(): WagmiConfig | null {
  return wagmiConfig;
}

/** Reset — tests only. */
export function resetWagmiConfigForTests(): void {
  wagmiConfig = null;
}
