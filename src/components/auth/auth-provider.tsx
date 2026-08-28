'use client';

import { useEffect, type ReactNode } from 'react';
import { useGetSessionQuery } from '@/store/apis/auth-api';
import { effectiveUserGroups } from '@/lib/auth/jwt';
import { resetAuth, setSession } from '@/store/auth-slice';
import { useAppDispatch } from '@/store/hooks';

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { data, isSuccess, isError, refetch } = useGetSessionQuery();

  useEffect(() => {
    const onWalletLinked = () => {
      void refetch();
    };
    window.addEventListener('tokenizmyapp:wallet-linked', onWalletLinked);
    return () => window.removeEventListener('tokenizmyapp:wallet-linked', onWalletLinked);
  }, [refetch]);

  useEffect(() => {
    if (isSuccess && data?.success) {
      dispatch(setSession({
        tier: data.data.tier,
        user: data.data.user,
        roleCode: data.data.roleCode ?? null,
        platformAdmin:
          (data.data.platformAdmin ?? false) ||
          (data.data.groups ?? []).includes('platform-admin'),
        groups: effectiveUserGroups(
          data.data.groups ?? [],
          (data.data.platformAdmin ?? false) ||
            (data.data.groups ?? []).includes('platform-admin'),
        ),
        permissions: data.data.permissions ?? [],
        walletAddress: data.data.walletAddress ?? null,
        walletChainId: data.data.walletChainId ?? null,
      }));
      return;
    }
    if (isError) {
      dispatch(resetAuth());
    }
  }, [isSuccess, isError, data, dispatch]);

  return children;
}
