import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";

// Define types for the product item data
interface VariationOption {
  value: string;
  variation: {
    name: string;
  };
}

interface ProductItem {
  barcode: string;
  cost: number;
  price: number;
  totalNumberOfValid: number;
  totalNumberOfDamaged: number;
  name: string;
  mainPhoto: string;
  expiryDate: string;
  deletedAt: string | null;
  photos: string[];
  variationOptions: VariationOption[];
  branchId: number;
  brand: string;
  categoryId: number;
  isActive: boolean;
  unitId: number;
  currencyId: number;
}

interface Product {
  id: number;
  name: string;
  branchId: number;
  brand: string;
  categoryId: number;
  isActive: boolean;
  unitId: number;
  deletedAt: string | null;
  currencyId: number;
  branchName: string;
  categoryName: string;
  unitName: string;
  currencyName: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}

interface ProductItemsResponse {
  data: ProductItem[];
  pagination: Pagination;
}

interface ApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  data: T;
  message: string;
}

interface CreateProductRequest {
  name: string;
  nameAr: string;
  branchId: number;
  brand: string;
  categoryId: number;
  isActive: boolean;
  unitId: number;
  currencyId: number;
  productItems: ProductItem[];
}

export const productApiSlice = createApi({
  reducerPath: "productApi",
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
  tagTypes: ["product"],
  endpoints: (builder) => ({
    getAllproduct: builder.query<
      ApiResponse<ProductListResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/products?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    addDaamgedProduct: builder.mutation<
      ApiResponse<any>,
      { productItemId: string; numberOfDamaged: number }
    >({
      query: (data) => ({
        url: `/api/v1/product-item/add-damaged`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
    getproductItems: builder.query<
      ApiResponse<ProductItemsResponse>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/api/v1/product-item?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    productSearch: builder.query<
      ApiResponse<ProductItemsResponse>,
      { name: string; page?: number; limit?: number }
    >({
      query: ({ name, page = 1, limit = 10 }) => ({
        url: `/api/v1/product-item/search?name=${name}&page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["product"],
    }),
    createProduct: builder.mutation<ApiResponse<any>, CreateProductRequest>({
      query: (data) => ({
        url: `/api/v1/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useGetAllproductQuery,
  useAddDaamgedProductMutation,
  useGetproductItemsQuery,
  useProductSearchQuery,
  useCreateProductMutation,
} = productApiSlice;
