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
