import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone: string;
  isActive: boolean;
  isBlocked: boolean;
  deletedAt: string | null;
  addressId: number | null;
  branchId: number;
  roleIds: number[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface UserListResponse {
  data: User[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const userApiSlice = createApi({
  reducerPath: "userApi",
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
  tagTypes: ["user"],
  endpoints: (builder) => ({
    getAlluser: builder.query<
      ApiResponse<UserListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/users?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),
    createUser: builder.mutation<
      ApiResponse<any>,
      {
        name: string;
        email: string;
        password: string;
        username: string;
        phone: string;
        branchId: number;
        roleIds: number[];
      }
    >({
      query: (data) => ({
        url: `/api/v1/users`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
    updateUser: builder.mutation<
      ApiResponse<any>,
      {
        id: number;
        name: string;
        email: string;
        username: string;
        phone: string;
        branchId: number;
        roleIds: number[];
        password?: string;
      }
    >({
      query: (data) => ({
        url: `/api/v1/users/${data.id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["user"],
    }),
    deleteUser: builder.mutation<ApiResponse<any>, { id: number }>({
      query: (data) => ({
        url: `/api/v1/users/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["user"],
    }),
  }),
});

export const {
  useGetAlluserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
