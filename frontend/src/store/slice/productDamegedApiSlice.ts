import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const productDamegedApiSlice = createApi({
  reducerPath: "productDamegedApi",
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

  tagTypes: ["productDameged"],
  endpoints: (builder) => ({
    getAllproductDameged: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/product-item/damaged`,
        method: "GET",
      }),
      providesTags: ["productDameged"],
    }),
  }),
});

export const { useGetAllproductDamegedQuery } = productDamegedApiSlice;
