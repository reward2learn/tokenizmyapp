import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/user' }),
  tagTypes: ['Profile', 'Preferences', 'Activity', 'Task'],
  endpoints: (builder) => ({
    getProfile: builder.query({ query: () => '/profile', providesTags: ['Profile'] }),
    updateProfile: builder.mutation({ query: (body) => ({ url: '/profile', method: 'PUT', body }), invalidatesTags: ['Profile'] }),
    getPreferences: builder.query({ query: () => '/preferences', providesTags: ['Preferences'] }),
    updatePreferences: builder.mutation({ query: (body) => ({ url: '/preferences', method: 'PUT', body }), invalidatesTags: ['Preferences'] }),
    listActivity: builder.query({ query: () => '/activity', providesTags: ['Activity'] }),
    listTasks: builder.query({ query: () => '/tasks', providesTags: ['Task'] }),
    createTask: builder.mutation({ query: (body) => ({ url: '/tasks', method: 'POST', body }), invalidatesTags: ['Task'] }),
    updateTask: builder.mutation({ query: ({ id, ...body }) => ({ url: `/tasks/${id}`, method: 'PATCH', body }), invalidatesTags: ['Task'] }),
    completeTask: builder.mutation({ query: (id) => ({ url: `/tasks/${id}`, method: 'PATCH', body: { status: 'completed' } }), invalidatesTags: ['Task'] }),
    deleteTask: builder.mutation({ query: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }), invalidatesTags: ['Task'] }),
  }),
});

export const {
  useGetProfileQuery, useUpdateProfileMutation,
  useGetPreferencesQuery, useUpdatePreferencesMutation,
  useListActivityQuery, useListTasksQuery,
  useCreateTaskMutation, useUpdateTaskMutation, useCompleteTaskMutation, useDeleteTaskMutation,
} = userApi;
