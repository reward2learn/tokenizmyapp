/** EIP-55-compatible hex address (42 chars). */
export const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** Used when AppKit SIWX calls getNonce before the embedded wallet address is known. */
export const SIWE_PLACEHOLDER_ADDRESS =
  '0x0000000000000000000000000000000000000000' as const;

export function isValidEvmAddress(
  value: string | undefined | null,
): value is `0x${string}` {
  return Boolean(value && EVM_ADDRESS_RE.test(value));
}

/** Reject AppKit template tokens like `<<AccountAddress>>` — fall back to the SIWE placeholder. */
export function resolveSiweNonceAddress(value: string | undefined | null): `0x${string}` {
  return isValidEvmAddress(value) ? value : SIWE_PLACEHOLDER_ADDRESS;
}

export function isSiwePlaceholderAddress(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.toLowerCase() === SIWE_PLACEHOLDER_ADDRESS;
}

/** True when the SIWE body was minted before AppKit knew the embedded wallet address. */
export function siweMessageUsesPlaceholderAddress(message: string): boolean {
  if (message.includes('<<AccountAddress>>')) return true;

  const lines = message.replace(/\r\n/g, '\n').split('\n');
  const headerIdx = lines.findIndex((line) =>
    line.includes('wants you to sign in with your Ethereum account:'),
  );
  if (headerIdx === -1) return false;

  const headerLine = lines[headerIdx] ?? '';
  const inlineMatch = headerLine.match(/0x[a-fA-F0-9]{40}/);
  if (inlineMatch) return isSiwePlaceholderAddress(inlineMatch[0]);

  const nextLine = (lines[headerIdx + 1] ?? '').trim();
  if (EVM_ADDRESS_RE.test(nextLine)) return isSiwePlaceholderAddress(nextLine);

  return false;
}
