import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SignInPanel } from '@/components/auth/sign-in-panel';
import { authSlice } from '@/store/auth-slice';
import { authApi } from '@/store/apis/auth-api';

vi.mock('next/navigation', () => ({
  usePathname: () => '/ops-admin',
  useSearchParams: () => new URLSearchParams(''),
}));

function mockFetchResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    clone: function clone() {
      return mockFetchResponse(data);
    },
    headers: new Headers({ 'content-type': 'application/json' }),
  };
}

function renderPanel(requiredTier: 'pin' | 'google' = 'pin') {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefault) => getDefault().concat(authApi.middleware),
  });

  return render(
    <Provider store={store}>
      <SignInPanel requiredTier={requiredTier} />
    </Provider>,
  );
}

describe('SignInPanel', () => {
  beforeEach(() => {
    // The panel renders the PIN form only when list-pin-users returns
    // PIN-configured accounts (user list comes from user_accounts + roles).
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        // fetchBaseQuery hands fetch a Request object — read .url from it.
        const url = typeof input === 'string' ? input : (input as Request).url;
        if (url.includes('action=list-pin-users')) {
          return Promise.resolve(
            mockFetchResponse({
              success: true,
              data: {
                users: [
                  { sub: 'u-1', name: 'Budi', role: 'owner', pinConfigured: true },
                  { sub: 'u-2', name: 'Sari', role: 'manager', pinConfigured: true },
                ],
                lastUsedName: null,
                lastUsedSub: null,
              },
            }),
          );
        }
        return Promise.resolve(mockFetchResponse({ ok: true, success: true }));
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders PIN and Google options for pin tier', async () => {
    renderPanel();
    expect(screen.getByTestId('sign-in-panel')).toBeInTheDocument();
    expect(screen.getByText('Ops sign-in')).toBeInTheDocument();
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    // The PIN form renders after list-pin-users resolves (async user list).
    expect(await screen.findByTestId('pin-input')).toBeInTheDocument();
  });

  it('offers PIN on a google-tier page too', async () => {
    // Regression: the PIN form was hidden whenever a page required the google
    // tier — which is most of them — so a staff member holding only a PIN met
    // a panel with Google as the sole option and no way in at all. Their
    // credential existed and the product never asked for it.
    renderPanel('google');

    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
    expect(await screen.findByTestId('pin-input')).toBeInTheDocument();
    expect(await screen.findByTestId('pin-submit')).toBeInTheDocument();
  });

  it('warns that a PIN will not unlock a google-only page', async () => {
    // Signing in successfully and still seeing the wall is indistinguishable
    // from a failed login, so the limitation is stated before it is hit.
    renderPanel('google');
    await screen.findByTestId('pin-input');

    expect(screen.getByText(/staff access/i)).toBeInTheDocument();
    expect(screen.getByText(/needs Google/i)).toBeInTheDocument();
  });

  it('does not claim the page is google-only when a PIN would work', async () => {
    renderPanel('pin');
    await screen.findByTestId('pin-input');

    expect(screen.queryByText(/needs Google/i)).not.toBeInTheDocument();
  });
});

describe('SignInPanel with no PIN accounts configured', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : (input as Request).url;
        if (url.includes('action=list-pin-users')) {
          return Promise.resolve(
            mockFetchResponse({
              success: true,
              data: { users: [], lastUsedName: null, lastUsedSub: null },
            }),
          );
        }
        return Promise.resolve(mockFetchResponse({ ok: true, success: true }));
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('still offers a usable PIN form with a free-text name field', async () => {
    // The account list is an enhancement, not a prerequisite. verify-pin falls
    // back to DEFAULT_ADMIN_PIN / DEFAULT_PIN_<sub> from the environment so
    // sign-in survives the database being unavailable — a form that cannot
    // render without the list makes that fallback unreachable.
    renderPanel('pin');

    expect(await screen.findByTestId('pin-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('pin-input')).toBeInTheDocument();
    expect(screen.getByTestId('pin-submit')).toBeInTheDocument();
    // No dropdown to populate, so none is rendered.
    expect(screen.queryByTestId('pin-role-select')).not.toBeInTheDocument();
  });

  it('offers the same fallback on a google-tier page', async () => {
    renderPanel('google');
    expect(await screen.findByTestId('pin-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('pin-submit')).toBeInTheDocument();
  });

  it('tells the user to type the name rather than showing a dead end', async () => {
    renderPanel('pin');
    await screen.findByTestId('pin-name-input');
    expect(screen.getByText(/enter the account name directly/i)).toBeInTheDocument();
  });

  it('keeps internal table and function names out of public copy', async () => {
    // This copy used to name listConfiguredPinUsers and user_accounts.
    // Tolerable on a staff-only page; not on one every visitor can reach.
    const { container } = renderPanel('pin');
    await screen.findByTestId('pin-name-input');
    expect(container.textContent).not.toMatch(/listConfiguredPinUsers|user_accounts/);
  });

  it('never leaves the form behind a spinner', async () => {
    // The regression the user hit locally: the whole form was replaced by a
    // spinner until the list resolved, and a hanging query meant it never did.
    renderPanel('pin');
    await screen.findByTestId('pin-input');
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
