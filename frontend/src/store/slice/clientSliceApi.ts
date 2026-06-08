import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  deletedAt: string | null;
  addressId: number | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ClientListResponse {
  data: Client[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const clientApiSlice = createApi({
  reducerPath: "clientApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.BACK_END_API_URL}`,
    prepareHeaders: async (headers) => {
      const session = await getSession();
      if (session?.user?.token) {
        headers.set("Authorization", `Bearer ${session.user.token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["client"],
  endpoints: (builder) => ({
    getAllclient: builder.query<
      ApiResponse<ClientListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/clients?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["client"],
    }),
    createclient: builder.mutation<
      ApiResponse<any>,
      {
        name: string;
        email: string;
        phone_number: string;
        address: Address;
      }
    >({
      query: (data) => ({
        url: `/api/v1/clients`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["client"],
    }),
    updateclient: builder.mutation<
      ApiResponse<any>,
      {
        id: number;
        name: string;
        email: string;
        phone_number: string;
        address: Address;
      }
    >({
      query: (data) => ({
        url: `/api/v1/clients/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["client"],
    }),
    deleteclient: builder.mutation<ApiResponse<any>, { id: number }>({
      query: (data) => ({
        url: `/api/v1/clients/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["client"],
    }),
  }),
});

export const {
  useGetAllclientQuery,
  useCreateclientMutation,
  useUpdateclientMutation,
  useDeleteclientMutation,
} = clientApiSlice;
