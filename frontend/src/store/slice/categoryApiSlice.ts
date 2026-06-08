import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const categoryApiSlice = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.BACK_END_API_URL}`,
    prepareHeaders: async (headers) => {
      const session = await getSession();

      if (session?.user?.token) {
        headers.set("Authorization", `Bearer ${session.user?.token}`);
      }

      return headers;
    },
  }),

  tagTypes: ["category"],
  endpoints: (builder) => ({
    createCategory: builder.mutation<
      ApiResponse<any>,
      {
        name: string;
        nameAr: string;
        description: string;
        descriptionAr: string;
        branchId: number;
      }
    >({
      query: (data) => ({
        url: `/api/v1/categories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),
    getAllCategories: builder.query<
      ApiResponse<any>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/categories?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["category"],
    }),
    updateCategory: builder.mutation<
      ApiResponse<any>,
      {
        id: string;
        name?: string;
        nameAr?: string;
        description?: string;
        descriptionAr?: string;
      }
    >({
      query: (data) => ({
        url: `/api/v1/categories/${data.id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["category"],
    }),
    deleteCategory: builder.mutation<ApiResponse<any>, { id: string }>({
      query: (data) => ({
        url: `/api/v1/categories/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApiSlice;
