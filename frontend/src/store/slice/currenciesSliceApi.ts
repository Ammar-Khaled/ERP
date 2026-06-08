import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const currenciesApiSlice = createApi({
  reducerPath: "currenciesApi",
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

  tagTypes: ["currencies"],
  endpoints: (builder) => ({
    getAllcurrencies: builder.query<
      any,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/currencies/findAll?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["currencies"],
    }),
  }),
});

export const { useGetAllcurrenciesQuery } = currenciesApiSlice;
