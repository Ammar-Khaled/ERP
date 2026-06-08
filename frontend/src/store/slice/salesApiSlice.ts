import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const salesApiSlice = createApi({
  reducerPath: "salesApi",
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

  tagTypes: ["sales"],
  endpoints: (builder) => ({
    getAllsales: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/orders/findAll?page=1&limit=10`,
        method: "GET",
      }),
      providesTags: ["sales"],
    }),
  }),
});

export const { useGetAllsalesQuery } = salesApiSlice;
