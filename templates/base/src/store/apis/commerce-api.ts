import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const commerceApi = createApi({
  reducerPath: 'commerceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/commerce' }),
  tagTypes: ['Product', 'Order', 'Booking', 'Cart', 'Customer'],
  endpoints: (builder) => ({
    // Products
    listProducts: builder.query({
      query: (filters?: { category?: string; type?: string; active?: boolean }) => ({
        url: '/products',
        params: filters,
      }),
      providesTags: ['Product'],
    }),
    getProduct: builder.query({
      query: (id: string) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
    }),
    deleteProduct: builder.mutation({
      query: (id: string) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    // Cart
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (body: { productId: string; qty: number }) => ({
        url: '/cart',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: '/cart',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    // Orders
    createOrder: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Order'],
    }),
    listOrders: builder.query({
      query: (filters?: { status?: string; userId?: string }) => ({
        url: '/orders',
        params: filters,
      }),
      providesTags: ['Order'],
    }),
    getOrder: builder.query({
      query: (id: string) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Order', id }],
    }),
    // Bookings
    createBooking: builder.mutation({
      query: (body: Record<string, unknown>) => ({
        url: '/bookings',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Booking'],
    }),
    listBookings: builder.query({
      query: (filters?: { status?: string; userId?: string }) => ({
        url: '/bookings',
        params: filters,
      }),
      providesTags: ['Booking'],
    }),
    getBooking: builder.query({
      query: (id: string) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/bookings/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),
    deleteBooking: builder.mutation({
      query: (id: string) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
    // Customers
    listCustomers: builder.query({
      query: (search?: string) => ({
        url: '/customers',
        params: search ? { search } : undefined,
      }),
      providesTags: ['Customer'],
    }),
  }),
});

export const {
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCartQuery,
  useAddToCartMutation,
  useClearCartMutation,
  useCreateOrderMutation,
  useListOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
  useCreateBookingMutation,
  useListBookingsQuery,
  useGetBookingQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
  useListCustomersQuery,
} = commerceApi;
