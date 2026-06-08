import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface OrderItem {
  numberOfItems: number;
  productItemId: number;
}

interface Order {
  id: number;
  totalPrice: number;
  date: any; // Adjust based on actual date format
  deletedAt: string | null;
  branchId: number;
  inventoryId: number;
  userId: number;
  clientId: number;
  statusId: number;
  couponId: number | null;
  currencyId: number;
}

interface CreateOrderRequest {
  date: string;
  inventoryId: number;
  clientId: number;
  couponId: number | null;
  currencyId: number;
  items: OrderItem[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface OrderListResponse {
  data: Order[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const ordersApiSlice = createApi({
  reducerPath: "ordersApi",
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
  tagTypes: ["orders"],
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiResponse<any>, CreateOrderRequest>({
      query: (data) => ({
        url: `/api/v1/orders/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["orders"],
    }),
    getAllOrder: builder.query<
      ApiResponse<OrderListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/orders/findAll?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
    deleteOrder: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/orders/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["orders"],
    }),
    printOrderPDF: builder.query<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/orders/${id}/pdf`,
        method: "GET",
      }),
      providesTags: ["orders"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetAllOrderQuery,
  useDeleteOrderMutation,
  usePrintOrderPDFQuery,
} = ordersApiSlice;
