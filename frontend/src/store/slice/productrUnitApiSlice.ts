import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const productUnitApiSlice = createApi({
  reducerPath: "productUnitApi",
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

  tagTypes: ["productUnit"],
  endpoints: (builder) => ({
    getAllproductUnit: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/units?page=1&limit=10`,
        method: "GET",
      }),
      providesTags: ["productUnit"],
    }),
  }),
});

export const { useGetAllproductUnitQuery } = productUnitApiSlice;
