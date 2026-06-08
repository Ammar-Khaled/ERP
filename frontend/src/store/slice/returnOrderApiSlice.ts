import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const returnsOrderApiSlice = createApi({
  reducerPath: "returnsOrderApi",
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
  tagTypes: ["returnsOrder"],
  endpoints: (builder) => ({
    getAllreturnsOrder: builder.query<
      ApiResponse<any[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/return/find-all?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["returnsOrder"],
    }),
    createReturnOrder: builder.mutation<
      ApiResponse<any>,
      {
        date: string;
        reason: string;
        reasonAr: string;
        returnItemDtos: {
          numberOfItems: number;
          orderItemId: number;
        }[];
        orderId: number;
        statusId: number;
      }
    >({
      query: (body) => ({
        url: `/api/v1/return/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["returnsOrder"],
    }),
    deleteReturnOrder: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/return/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["returnsOrder"],
    }),
  }),
});

export const {
  useGetAllreturnsOrderQuery,
  useCreateReturnOrderMutation,
  useDeleteReturnOrderMutation,
} = returnsOrderApiSlice;
