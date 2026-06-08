import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const returnsPurchasesApiSlice = createApi({
  reducerPath: "returnsPurchasesApi",
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
  tagTypes: ["returnsPurchases"],
  endpoints: (builder) => ({
    getAllreturnsPurchases: builder.query<ApiResponse<any[]>, any>({
      query: () => ({
        url: `/api/v1/return-purchase/find-all`,
        method: "GET",
      }),
      providesTags: ["returnsPurchases"],
    }),
    createReturnPurchases: builder.mutation<
      ApiResponse<any>,
      {
        date: string;
        reason: string;
        reasonAr: string;
        purchaseRequestId: number;
        returnPurchaseItemDtos: {
          purchaseItemId: number;
          numberOfReturned: number;
        }[];
        statusId: number;
      }
    >({
      query: (body) => ({
        url: `/api/v1/return-purchase/create`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["returnsPurchases"],
    }),
    deleteReturnPurchases: builder.mutation<ApiResponse<any>, { id: string }>({
      query: ({ id }) => ({
        url: `/api/v1/return-purchase/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["returnsPurchases"],
    }),
  }),
});

export const {
  useGetAllreturnsPurchasesQuery,
  useCreateReturnPurchasesMutation,
  useDeleteReturnPurchasesMutation,
} = returnsPurchasesApiSlice;
