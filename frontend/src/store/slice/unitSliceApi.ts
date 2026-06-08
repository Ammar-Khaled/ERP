import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const unitApiSlice = createApi({
  reducerPath: "unitApi",
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

  tagTypes: ["unit"],
  endpoints: (builder) => ({
    getAllunit: builder.query<
      any,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/units?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["unit"],
    }),
  }),
});

export const { useGetAllunitQuery } = unitApiSlice;
