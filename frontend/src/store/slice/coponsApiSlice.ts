import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface Coupon {
  id: number;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  discountPercentage: number;
  maxAllowed: number;
  currentUsage: number;
  numberOfUsageTimePerUser: number;
  minInvoiceTotal: number;
  isActive: boolean;
  deletedAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CouponListResponse {
  data: Coupon[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const couponApiSlice = createApi({
  reducerPath: "couponApi",
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
  tagTypes: ["coupon"],
  endpoints: (builder) => ({
    getAllcoupon: builder.query<
      ApiResponse<CouponListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/coupons/findAll?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),
    createCoupon: builder.mutation<
      ApiResponse<any>,
      {
        name: string;
        code: string;
        startDate: string;
        endDate: string;
        discountPercentage: number;
        maxAllowed: number;
        numberOfUsageTimePerUser: number;
        minInvoiceTotal: number;
        isActive: boolean;
      }
    >({
      query: (couponData) => ({
        url: `/api/v1/coupons/create`,
        method: "POST",
        body: couponData,
      }),
      invalidatesTags: ["coupon"],
    }),
    findByCodeName: builder.query<ApiResponse<Coupon>, { code: string }>({
      query: ({ code }) => ({
        url: `/api/v1/coupons/findByCode/${code}`,
        method: "GET",
      }),
      providesTags: ["coupon"],
    }),
    deleteCoupon: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/coupons/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["coupon"],
    }),
    updateCoupon: builder.mutation<
      ApiResponse<any>,
      {
        id: string;
        name: string;
        code: string;
        startDate: string;
        endDate: string;
        discountPercentage: number;
        maxAllowed: number;
        numberOfUsageTimePerUser: number;
        minInvoiceTotal: number;
        isActive: boolean;
      }
    >({
      query: (couponData) => ({
        url: `/api/v1/coupons/update/${couponData.id}`,
        method: "PATCH",
        body: couponData,
      }),
      invalidatesTags: ["coupon"],
    }),
  }),
});

export const {
  useGetAllcouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useFindByCodeNameQuery,
} = couponApiSlice;
