import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface PurchaseItem {
  purchaseEntityName: string;
  numberOfItems: number;
  discount: number;
}

interface Purchase {
  id: number;
  date: any; // Adjust based on actual date format
  totalPrice: string;
  userId: number;
  branchId: number;
  supplierId: number;
  statusId: number;
  currencyId: number;
  deletedAt: string | null;
  reviewerId: number | null;
  reviewNotes: string | null;
  inventoryId: number;
  invoiceNo: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PurchaseListResponse {
  data: Purchase[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const purchaseApiSlice = createApi({
  reducerPath: "purchaseApi",
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
  tagTypes: ["purchase"],
  endpoints: (builder) => ({
    getAllpurchase: builder.query<
      ApiResponse<PurchaseListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/purchase-requests?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),
    createPurchase: builder.mutation<
      ApiResponse<any>,
      {
        date: string;
        supplierId: number;
        currencyId: number;
        inventoryId: number;
        purchaseItemsDtos: {
          purchaseEntityName: string;
          numberOfItems: number;
          discount: number;
        }[];
      }
    >({
      query: (purchaseData) => ({
        url: `/api/v1/purchase-requests`,
        method: "POST",
        body: purchaseData,
      }),
      invalidatesTags: ["purchase"],
    }),
    cancelPurchase: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/purchase-requests/cancel/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["purchase"],
    }),
    approvePurchase: builder.mutation<
      ApiResponse<any>,
      { id: string; userId: number }
    >({
      query: ({ id, userId }) => ({
        url: `/api/v1/purchase-requests/review/${id}`,
        method: "PATCH",
        headers: {
          "X-User-ID": userId.toString(),
        },
      }),
      invalidatesTags: ["purchase"],
    }),
    deletePurchase: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/purchase-requests/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["purchase"],
    }),
    printPurchasePDF: builder.query<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/purchase-requests/${id}/pdf`,
        method: "GET",
      }),
      providesTags: ["purchase"],
    }),
  }),
});

export const {
  useGetAllpurchaseQuery,
  useCreatePurchaseMutation,
  useCancelPurchaseMutation,
  useApprovePurchaseMutation,
  useDeletePurchaseMutation,
  usePrintPurchasePDFQuery,
} = purchaseApiSlice;
