/**
 * Clear Reown AppKit auth tokens and connection state from browser storage.
 *
 * When a social wallet session is revoked server-side (e.g. via disconnect),
 * AppKit's localStorage tokens become stale.  On the next page load, AppKit
 * tries to refresh them via api.toaster.magic.link — gets 401 "revoked" —
 * and hangs internally, preventing open() from working.
 *
 * This module proactively clears the stale tokens so AppKit starts fresh.
 *
 * @see https://github.com/reown-com/appkit/blob/main/packages/appkit-controllers/src/utils/StorageUtil.ts
 */
import { resetAppKit } from '@/lib/web3/appkit-client';

/**
 * Known Reown/AppKit localStorage key prefixes.
 *
 * AppKit uses `SafeLocalStorage` which wraps localStorage with a `w3m_` prefix
 * for most keys.  The ReownAuthentication module stores auth/nonce tokens under
 * `w3m_siwx_auth_token` and `w3m_siwx_nonce_token`.
 *
 * We match any key starting with these prefixes to be future-proof.
 */
const REOWN_KEY_PREFIXES = [
  'w3m_',
  'wc@',
  'walletconnect',
];

/**
 * Known exact Reown/AppKit localStorage keys (for precision).
 * These are the critical ones that cause the stale session hang.
 */
const REOWN_EXACT_KEYS = [
  'w3m_siwx_auth_token',
  'w3m_siwx_nonce_token',
  'w3m_active_namespace',
  'w3m_active_caip_network_id',
  'w3m_connection_status',
  'w3m_connected_namespaces',
  'w3m_recent_wallet',
  'w3m_recent_wallets',
  'w3m_deeplink_choice',
  'w3m_connected_social',
  'w3m_connected_social_username',
  'w3m_preferred_account_types',
  'w3m.telegram_social_provider',
];

function clearReownLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const ls = window.localStorage;
    const keysToRemove: string[] = [];

    // Collect all keys matching known Reown prefixes or exact names
    for (let i = 0; i < ls.length; i++) {
      const key = ls.key(i);
      if (!key) continue;

      if (REOWN_EXACT_KEYS.includes(key)) {
        keysToRemove.push(key);
        continue;
      }

      if (REOWN_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        keysToRemove.push(key);
        continue;
      }
    }

    for (const key of keysToRemove) {
      ls.removeItem(key);
    }

    if (keysToRemove.length > 0) {
      console.log('[reown-storage] Cleared', keysToRemove.length, 'localStorage keys:', keysToRemove.join(', '));
    }
  } catch (err) {
    console.warn('[reown-storage] Failed to clear localStorage:', err);
  }
}

/**
 * Clear Reown/AppKit IndexedDB databases.
 *
 * AppKit (via WalletConnect) stores connection state in IndexedDB.
 * If these contain stale session data, they can interfere with fresh init.
 */
async function clearReownIndexedDB(): Promise<void> {
  if (typeof window === 'undefined' || !window.indexedDB) return;

  try {
    const databases = await window.indexedDB.databases();
    const reownDbs = databases
      .filter((db) => {
        const name = db.name?.toLowerCase() ?? '';
        return (
          name.includes('walletconnect') ||
          name.includes('w3m') ||
          name.includes('appkit') ||
          name.includes('reown') ||
          name.includes('web3modal')
        );
      })
      .map((db) => db.name)
      .filter((name): name is string => Boolean(name));

    for (const dbName of reownDbs) {
      window.indexedDB.deleteDatabase(dbName);
      console.log('[reown-storage] Deleted IndexedDB:', dbName);
    }
  } catch (err) {
    console.warn('[reown-storage] Failed to clear IndexedDB:', err);
  }
}

/**
 * Full cleanup of Reown/AppKit storage + singleton reset.
 *
 * Call this after a successful JWT unlink to prevent stale tokens from
 * causing the 401 "revoked" hang on next page load.
 */
export async function clearReownSessionStorage(): Promise<void> {
  console.log('[reown-storage] Clearing Reown session storage...');
  clearReownLocalStorage();
  await clearReownIndexedDB();
  resetAppKit();
  console.log('[reown-storage] Cleanup complete — AppKit singleton reset');
}
