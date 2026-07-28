import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery,
    tagTypes: ['Session'],
    endpoints: (builder) => ({
        getSession: builder.query({
            query: () => 'auth?action=me',
            providesTags: ['Session'],
        }),
        verifyPin: builder.mutation({
            query: (body) => ({
                url: 'auth?action=verify-pin',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Session'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: 'auth?action=logout',
                method: 'GET',
                responseHandler: 'text',
            }),
            invalidatesTags: ['Session'],
        }),
        listPinUsers: builder.query({
            query: () => 'auth?action=list-pin-users',
        }),
    }),
});
export const { useGetSessionQuery, useVerifyPinMutation, useLogoutMutation, useListPinUsersQuery, } = authApi;
