import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProfilePanel } from '@/components/settings/profile-panel';
import { authApi } from '@/store/apis/auth-api';
import { authSlice } from '@/store/auth-slice';

vi.mock('@/components/settings/avatar-upload', () => ({
  AvatarUpload: () => <div>avatar upload</div>,
}));

vi.mock('@/lib/auth/use-user-avatar-url', () => ({
  useUserAvatarUrl: () => 'https://example.com/avatar.png',
}));

vi.mock('@/lib/auth/use-user-display-name', () => ({
  useUserDisplayName: () => 'Jane Doe',
}));

vi.mock('@shared/lib/config/tenant', () => ({
  isPlatformApp: vi.fn(() => false),
}));

const updateProfile = vi.fn(() => ({
  unwrap: () => Promise.resolve({ success: true, data: { message: 'Profile updated' } }),
}));

vi.mock('@/store/apis/auth-api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/apis/auth-api')>();
  return {
    ...actual,
    useGetUserProfileQuery: () => ({
      data: {
        success: true,
        data: { avatarUrl: null, displayName: 'Jane Doe' },
      },
    }),
    useUpdateUserProfileMutation: () => [updateProfile, { isLoading: false }],
  };
});

function renderPanel() {
  const store = configureStore({
    reducer: {
      auth: authSlice.reducer,
      [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefault) =>
      getDefault({ serializableCheck: false }).concat(authApi.middleware),
  });

  store.dispatch(
    authSlice.actions.setSession({
      tier: 'google',
      user: {
        id: 'user_1',
        email: 'jane@example.com',
        name: 'Jane Doe',
        authMethod: 'google',
      },
      roleCode: 'member',
    }),
  );

  return render(
    <Provider store={store}>
      <ProfilePanel />
    </Provider>,
  );
}

afterEach(cleanup);

describe('ProfilePanel', () => {
  it('lets the user edit their display name and save', async () => {
    renderPanel();

    const input = screen.getByLabelText('Display name');
    expect(input).not.toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();

    fireEvent.change(input, { target: { value: 'Jane Smith' } });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalledWith({ displayName: 'Jane Smith' });
    });
  });
});
