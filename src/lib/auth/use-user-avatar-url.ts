'use client';

import { useAppSelector } from '@/store/hooks';
import { useGetUserProfileQuery } from '@/store/apis/auth-api';

/**
 * Resolved avatar for the signed-in user — custom upload wins over the
 * provider picture, matching AvatarUpload in Settings → Profile.
 */
export function useUserAvatarUrl(): string | undefined {
  const { user, tier } = useAppSelector((s) => s.auth);
  const { data: profileData } = useGetUserProfileQuery(undefined, {
    skip: !user?.email || tier === 'public',
  });

  const customUrl = profileData?.data?.avatarUrl || undefined;
  return customUrl || user?.picture || undefined;
}
