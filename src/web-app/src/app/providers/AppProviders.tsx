import type {ReactNode} from "react";

import {BrowserRouter} from "react-router-dom";
import {QueryClientProvider} from "@tanstack/react-query";
import {Toaster} from "react-hot-toast";
import {queryClient} from "../../services/queryClient.ts";
import {AuthProvider} from "../../context/auth/AuthProvider.tsx";


export default function AppProviders({children}: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right"/>

      <AuthProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
