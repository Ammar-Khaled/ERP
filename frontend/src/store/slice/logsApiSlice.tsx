import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Types
interface Log {
  id: number;
  timestamp: any; // Adjust based on actual timestamp format
  level: string;
  packetType: string;
  userId: number;
  ipAddress: string;
  userAgent: string;
  action: string;
  endpoint: string;
  method: string;
  responseTime: number;
  errorMessage: string | null;
  trace: string | null;
  metadata: any | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface LogsListResponse {
  data: Log[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

export const logsApiSlice = createApi({
  reducerPath: "logsApi",
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
  tagTypes: ["logs"],
  endpoints: (builder) => ({
    getAlllogs: builder.query<
      ApiResponse<Log[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/logs?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["logs"],
    }),
  }),
});

export const { useGetAlllogsQuery } = logsApiSlice;
