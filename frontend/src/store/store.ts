import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import CustomizerReducer from "./customizer/CustomizerSlice";
import { inventoryApiSlice } from "./slice/inventoryApiSlice";
import { productApiSlice } from "./slice/productApiSlice";
import { productUnitApiSlice } from "./slice/productrUnitApiSlice";
import { productDamegedApiSlice } from "./slice/productDamegedApiSlice";
import { salesApiSlice } from "./slice/salesApiSlice";
import { ordersApiSlice } from "./slice/ordersApiSlice";
import { categoryApiSlice } from "./slice/categoryApiSlice";
import { unitApiSlice } from "./slice/unitSliceApi";
import { currenciesApiSlice } from "./slice/currenciesSliceApi";
import { permissionsApiSlice } from "./slice/permissionSliceApi";
import { userApiSlice } from "./slice/userSliceApi";
import { clientApiSlice } from "./slice/clientSliceApi";
import { suppliersApiSlice } from "./slice/suppliersApiSlice";
import { logsApiSlice } from "./slice/logsApiSlice";
import { couponApiSlice } from "./slice/coponsApiSlice";
import { purchaseApiSlice } from "./slice/purchaseRequest";
import { returnsOrderApiSlice } from "./slice/returnOrderApiSlice";
import { returnsPurchasesApiSlice } from "./slice/returnPurchesApiSlice";

const persistConfig = {
  key: "root",
  storage,
};

export const store = configureStore({
  reducer: {
    customizer: persistReducer<any>(persistConfig, CustomizerReducer),
    [inventoryApiSlice.reducerPath]: inventoryApiSlice.reducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer,
    [productUnitApiSlice.reducerPath]: productUnitApiSlice.reducer,
    [productDamegedApiSlice.reducerPath]: productDamegedApiSlice.reducer,
    [salesApiSlice.reducerPath]: salesApiSlice.reducer,
    [ordersApiSlice.reducerPath]: ordersApiSlice.reducer,
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
    [unitApiSlice.reducerPath]: unitApiSlice.reducer,
    [permissionsApiSlice.reducerPath]: permissionsApiSlice.reducer,
    [currenciesApiSlice.reducerPath]: currenciesApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [clientApiSlice.reducerPath]: clientApiSlice.reducer,
    [suppliersApiSlice.reducerPath]: suppliersApiSlice.reducer,
    [logsApiSlice.reducerPath]: logsApiSlice.reducer,
    [couponApiSlice.reducerPath]: couponApiSlice.reducer,
    [purchaseApiSlice.reducerPath]: purchaseApiSlice.reducer,
    [returnsOrderApiSlice.reducerPath]: returnsOrderApiSlice.reducer,
    [returnsPurchasesApiSlice.reducerPath]: returnsPurchasesApiSlice.reducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(
      inventoryApiSlice.middleware,
      productApiSlice.middleware,
      couponApiSlice.middleware,
      returnsOrderApiSlice.middleware,
      purchaseApiSlice.middleware,
      productUnitApiSlice.middleware,
      productDamegedApiSlice.middleware,
      salesApiSlice.middleware,
      ordersApiSlice.middleware,
      returnsPurchasesApiSlice.middleware,
      categoryApiSlice.middleware,
      unitApiSlice.middleware,
      currenciesApiSlice.middleware,
      permissionsApiSlice.middleware,
      userApiSlice.middleware,
      clientApiSlice.middleware,
      suppliersApiSlice.middleware,
      logsApiSlice.middleware
    ),
});

const rootReducer = combineReducers({
  customizer: CustomizerReducer,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof rootReducer>;
