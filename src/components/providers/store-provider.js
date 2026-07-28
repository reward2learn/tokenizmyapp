'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from '@/store';
export function StoreProvider({ children }) {
    const storeRef = useRef(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }
    return _jsx(Provider, { store: storeRef.current, children: children });
}
