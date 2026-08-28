const SOCIAL_CONNECTORS = new Set(['google', 'apple', 'email', 'x', 'discord', 'github', 'facebook']);

/** True when the wallet was provisioned via Reown social / embedded auth. */
export function isSocialWalletConnection(connectorId: string | null | undefined): boolean {
  if (!connectorId) return false;
  return SOCIAL_CONNECTORS.has(connectorId.toLowerCase());
}

export function hasAuthSuccessRedirect(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('auth') === 'success';
}

export function clearAuthSuccessRedirect(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has('auth')) return;
  url.searchParams.delete('auth');
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}
