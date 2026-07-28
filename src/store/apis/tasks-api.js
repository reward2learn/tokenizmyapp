import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@shared/store/base-query';
export const tasksApi = createApi({
    reducerPath: 'tasksApi',
    baseQuery,
    tagTypes: ['Task', 'Role'],
    endpoints: (builder) => ({
        listTasks: builder.query({
            query: (arg) => {
                const role = arg && 'role' in arg ? arg.role : undefined;
                return role ? `tasks?role=${encodeURIComponent(role)}` : 'tasks';
            },
            providesTags: ['Task'],
        }),
        createTask: builder.mutation({
            query: (body) => ({
                url: 'tasks',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Task'],
        }),
        updateTaskStatus: builder.mutation({
            query: (body) => ({
                url: 'tasks',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Task'],
        }),
    }),
});
export const { useListTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation, } = tasksApi;
