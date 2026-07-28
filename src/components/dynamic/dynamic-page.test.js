import { jsx as _jsx } from "react/jsx-runtime";
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { DynamicPage } from '@/components/dynamic/dynamic-page';
import { PAGE_CATALOG } from '@/lib/page-catalog';
import { makeStore } from '@/store';
function renderPage(slug) {
    const store = makeStore();
    const page = PAGE_CATALOG[slug];
    return render(_jsx(Provider, { store: store, children: _jsx(DynamicPage, { page: page }) }));
}
vi.mock('react-chartjs-2', () => ({
    Chart: () => _jsx("div", { "data-testid": "financial-chart-mock" }),
    Line: () => _jsx("div", { "data-testid": "financial-chart-mock" }),
}));
vi.mock('next/navigation', () => ({
    useSearchParams: () => new URLSearchParams(''),
    usePathname: () => '/dashboard',
}));
function mockFetchResponse(data) {
    return {
        ok: true,
        status: 200,
        json: async () => data,
        clone: function clone() {
            return mockFetchResponse(data);
        },
    };
}
describe('DynamicPage', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });
    it('renders dashboard hero from catalog', () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation((input) => {
            const url = String(input);
            if (url.includes('financial-overview')) {
                return Promise.resolve(mockFetchResponse({
                    success: true,
                    data: { labels: [], actual: {}, forecast: {} },
                }));
            }
            return Promise.resolve(mockFetchResponse({}));
        }));
        renderPage('dashboard');
        expect(screen.getByText(/July 2026/)).toBeInTheDocument();
        expect(screen.getByText(/Business Review/)).toBeInTheDocument();
        expect(screen.getByText('Sign in to Access')).toBeInTheDocument();
    });
    it('renders terms page markdown via content API', async () => {
        vi.stubGlobal('fetch', vi.fn().mockImplementation((input) => {
            const url = String(input);
            if (url.includes('/api/content')) {
                return Promise.resolve(mockFetchResponse({ markdown: '# Terms of Service\n\nTest terms body.' }));
            }
            return Promise.resolve(mockFetchResponse({ success: true, data: {} }));
        }));
        renderPage('terms-of-service');
        await waitFor(() => {
            expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument();
        });
    });
});
