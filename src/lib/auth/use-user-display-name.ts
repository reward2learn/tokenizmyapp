'use client';

import { useAppSelector } from '@/store/hooks';
import { useGetUserProfileQuery } from '@/store/apis/auth-api';

/**
 * Resolved display name for the signed-in user — profile override wins over the
 * auth provider name, matching Settings → Profile.
 */
export function useUserDisplayName(): string {
  const { user, tier } = useAppSelector((s) => s.auth);
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !user?.email || tier === 'public',
  });

  return profileData?.data?.displayName?.trim() || user?.name?.trim() || '';
}
