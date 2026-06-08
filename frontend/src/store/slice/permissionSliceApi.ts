import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

export const permissionsApiSlice = createApi({
  reducerPath: "permissionsApi",
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

  tagTypes: ["permissions"],
  endpoints: (builder) => ({
    getAllpermissions: builder.query<any, any>({
      query: () => ({
        url: `/api/v1/permissions`,
        method: "GET",
      }),
      providesTags: ["permissions"],
    }),
    getAllRoles: builder.query<
      any,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/roles?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["permissions"],
    }),
    craeteRole: builder.mutation<
      any,
      {
        name: string;
        description: string;
        permissionIds: number[];
      }
    >({
      query: (data) => ({
        url: `/api/v1/roles`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["permissions"],
    }),
    updateRole: builder.mutation<
      any,
      {
        id: number;
        name: string;
        description: string;
        permissionIds: number[];
      }
    >({
      query: (data) => ({
        url: `/api/v1/roles/${data.id}`,
        method: "PATCH",
        body: {
          name: data.name,
          description: data.description,
          permissionIds: data.permissionIds,
        },
      }),
      invalidatesTags: ["permissions"],
    }),
    deleteRole: builder.mutation<any, { id: number }>({
      query: (data) => ({
        url: `/api/v1/roles/${data.id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["permissions"],
    }),
    getRoleById: builder.query<any, { id: number }>({
      query: (data) => ({
        url: `/api/v1/roles/${data.id}`,
        method: "GET",
      }),
      providesTags: ["permissions"],
    }),
  }),
});

export const {
  useGetAllpermissionsQuery,
  useGetAllRolesQuery,
  useCraeteRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRoleByIdQuery,
} = permissionsApiSlice;
