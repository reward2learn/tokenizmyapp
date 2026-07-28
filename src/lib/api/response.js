import { NextResponse } from 'next/server';
export function jsonOk(data, init) {
    return NextResponse.json({ success: true, data }, init);
}
export function jsonError(error, status = 400) {
    return NextResponse.json({ success: false, error }, { status });
}
/** Legacy-compatible error shape (no success flag). */
export function legacyError(error, status = 400) {
    return NextResponse.json({ error }, { status });
}
