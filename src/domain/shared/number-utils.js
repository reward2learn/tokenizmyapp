export function num(v) {
    if (v == null || v === '')
        return null;
    if (typeof v === 'object' && v !== null && 'toNumber' in v) {
        const n = v.toNumber();
        return Number.isFinite(n) ? n : null;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}
/** Full IDR integer from DB Decimal or number. */
export function toIdrInt(v) {
    const n = num(v);
    return n == null ? 0 : Math.round(n);
}
export function snakeToCamel(key) {
    return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}
/** Convert camelCase or PascalCase to snake_case. */
export function camelToSnake(key) {
    return key
        .replace(/([A-Z]+|[0-9]+)/g, '_$1')
        .toLowerCase()
        .replace(/^_/, '');
}
