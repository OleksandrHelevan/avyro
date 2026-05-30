import { useMutation, useQueryClient } from "@tanstack/react-query";
import {PAYMENT_ACCOUNT_QUERY_KEY} from "../usePaymentAccount/usePaymentAccount.ts";
import type {TopUpRequest, TopUpResponse} from "../types.ts";
import {topUpBalance} from "../api/paymentsApi.ts";


export const useTopUpBalance = () => {
  const queryClient = useQueryClient();

  return useMutation<TopUpResponse, Error, TopUpRequest>({
    mutationFn: topUpBalance,
    onSuccess: () => {
      // Invalidate after Stripe confirms — called from component after stripe.confirmPayment
      queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNT_QUERY_KEY });
    },
  });
};
