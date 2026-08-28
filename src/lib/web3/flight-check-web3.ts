/**
 * Flight Check evaluators for Social Wallet / Reown — aligned with deploy wiring.
 *
 * Checks template.capabilities.web3Wallet (via resolveTemplate / listAllTemplates),
 * not tenant.metadata.config.web3Wallet, and NEXT_PUBLIC_REOWN_PROJECT_ID rather
 * than the legacy NEXT_PUBLIC_PROJECT_ID name from generic AppKit docs.
 */
import type { Web3WalletConfig } from '@/domain/tenant/template-catalog';
import { DEFAULT_WEB3_WALLET, resolveReownProjectId, resolveWeb3WalletForDeploy } from '@/lib/web3/reown';

export interface FlightCheckVerdict {
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}

/** Resolve web3Wallet from a merged template definition (built-in or custom). */
export function web3WalletFromTemplate(
  capabilities: { web3Wallet?: Web3WalletConfig } | null | undefined,
  tenantConfig?: { web3WalletEnabled?: boolean } | null,
): Web3WalletConfig {
  return resolveWeb3WalletForDeploy(capabilities?.web3Wallet, tenantConfig);
}

export function evaluateSocialWalletTemplate(
  config: Web3WalletConfig | null | undefined,
): FlightCheckVerdict {
  const wallet = config ?? DEFAULT_WEB3_WALLET;

  if (!wallet.enabled) {
    return {
      status: 'fail',
      detail:
        'Social wallet is disabled for this tenant. Enable it in Edit Tenant → Billing toggles (web3WalletEnabled), or set capabilities.web3Wallet.enabled on a custom template.',
    };
  }

  if (wallet.connectMode !== 'social') {
    return {
      status: 'fail',
      detail: `Template connectMode is "${wallet.connectMode}" — social wallet requires connectMode "social".`,
    };
  }

  if (!wallet.socialProviders.includes('google')) {
    return {
      status: 'fail',
      detail: `Template socialProviders (${wallet.socialProviders.join(', ') || 'none'}) must include "google".`,
    };
  }

  return {
    status: 'pass',
    detail: 'Template is configured for social wallet auth (Google OAuth + embedded wallet)',
  };
}

export function evaluateReownProjectIdForDeploy(
  walletEnabled: boolean,
  projectId = resolveReownProjectId(),
): FlightCheckVerdict {
  if (!walletEnabled) {
    return {
      status: 'warn',
      detail: 'N/A — web3 wallet disabled on template',
    };
  }

  if (!projectId) {
    return {
      status: 'warn',
      detail:
        'No Reown project id resolved — set REOWN_PROJECT_ID on the factory. Deploy writes NEXT_PUBLIC_REOWN_PROJECT_ID to the tenant app.',
    };
  }

  return {
    status: 'pass',
    detail: `Deploy stamps NEXT_PUBLIC_REOWN_PROJECT_ID (${projectId.slice(0, 16)}…) from platform REOWN_PROJECT_ID`,
  };
}

export function evaluateReownGoogleSocials(walletEnabled: boolean): FlightCheckVerdict {
  if (!walletEnabled) {
    return {
      status: 'warn',
      detail: 'N/A — web3 wallet disabled on template',
    };
  }

  return {
    status: 'warn',
    detail:
      'Manual check: enable Google under dashboard.reown.com → Your Project → Settings → Social & Email → Social Logins → Google, and register the tenant app origin under Domain / Callback URLs.',
  };
}
