import { useMutation, useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";
import {createPaymentAccount} from "../api/paymentsApi.ts";
import {PAYMENT_ACCOUNT_QUERY_KEY} from "../usePaymentAccount/usePaymentAccount.ts";

export const useCreatePaymentAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPaymentAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNT_QUERY_KEY });
      toast.success("Гаманець успішно створено!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Не вдалося створити гаманець");
    },
  });
};
