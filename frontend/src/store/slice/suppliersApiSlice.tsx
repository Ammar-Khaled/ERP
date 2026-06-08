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

interface suppliers {
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

interface suppliersListResponse {
  data: suppliers[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const suppliersApiSlice = createApi({
  reducerPath: "suppliersApi",
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
  tagTypes: ["suppliers"],
  endpoints: (builder) => ({
    getAllsuppliers: builder.query<
      ApiResponse<suppliersListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/suppliers?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["suppliers"],
    }),
    createsuppliers: builder.mutation<
      ApiResponse<any>,
      {
        name: string;
        email: string;
        phone_number: string;
        address: Address;
      }
    >({
      query: (data) => ({
        url: `/api/v1/suppliers`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),
    updatesuppliers: builder.mutation<
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
        url: `/api/v1/suppliers/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["suppliers"],
    }),
    deletesuppliers: builder.mutation<ApiResponse<any>, { id: number }>({
      query: (data) => ({
        url: `/api/v1/suppliers/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["suppliers"],
    }),
  }),
});

export const {
  useGetAllsuppliersQuery,
  useCreatesuppliersMutation,
  useUpdatesuppliersMutation,
  useDeletesuppliersMutation,
} = suppliersApiSlice;
