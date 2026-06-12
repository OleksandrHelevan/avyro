import { useQuery } from "@tanstack/react-query";
import {getPaymentAccount} from "../api/paymentsApi.ts";
import type {PaymentAccount} from "../types.ts";


export const PAYMENT_ACCOUNT_QUERY_KEY = ["paymentAccount"];

export const usePaymentAccount = () => {
  return useQuery<PaymentAccount, Error>({
    queryKey: PAYMENT_ACCOUNT_QUERY_KEY,
    queryFn: getPaymentAccount,
    // Don't throw on 404 — account may not exist yet
    retry: (failureCount, error) => {
      if (error?.message?.includes("404") || error?.message?.includes("not found")) {
        return false;
      }
      return failureCount < 2;
    },
  });
};
