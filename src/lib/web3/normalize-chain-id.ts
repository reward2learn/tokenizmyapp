/**
 * AppKit / WalletConnect often surface chain ids as CAIP-2 (`eip155:8453`).
 * viem writeContract expects a numeric chain id — passing the CAIP string yields
 * "Cannot convert eip155:8453 to a BigInt".
 */
export function normalizeChainId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'bigint' && value > 0n) {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : null;
  }
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  const caip = /^eip155:(\d+)$/i.exec(trimmed);
  if (caip?.[1]) {
    const parsed = Number.parseInt(caip[1], 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isInteger(parsed) && parsed > 0 && String(parsed) === trimmed
    ? parsed
    : null;
}
