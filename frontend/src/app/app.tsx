"use client";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/app/(DashboardLayout)/layout/shared/customizer/RTL";
import { ThemeSettings } from "@/utils/theme/Theme";
import { useSelector } from "react-redux";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { AppState } from "@/store/store";
import "@/utils/i18n";
import "@/app/api/index";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
const MyApp = ({ children }: { children: React.ReactNode }) => {
  const theme = ThemeSettings();
  const customizer = useSelector((state: AppState) => state.customizer);

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <SessionProvider refetchInterval={0}>
        <ThemeProvider theme={theme}>
          <RTL direction={customizer.activeDir}>
            <CssBaseline />
            <ToastContainer />
            {children}
          </RTL>
        </ThemeProvider>
      </SessionProvider>
    </AppRouterCacheProvider>
  );
};

export default MyApp;
