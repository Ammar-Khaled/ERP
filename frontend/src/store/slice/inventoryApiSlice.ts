import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const inventoryApiSlice = createApi({
  reducerPath: "inventoryApi",
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

  tagTypes: ["Inventory"],
  endpoints: (builder) => ({
    getAllInventory: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/inventories?page=1&limit=10`,
        method: "GET",
      }),
      providesTags: ["Inventory"],
    }),
  }),
});

export const { useGetAllInventoryQuery } = inventoryApiSlice;
