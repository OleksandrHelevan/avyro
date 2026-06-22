import type {
  CreateAccountResponse,
  PaymentAccount,
  TopUpRequest,
  TopUpResponse
} from "../types.ts";
import {apiClient} from "../../../services/apiClient.ts";

export const createPaymentAccount = async (): Promise<CreateAccountResponse> => {
  return apiClient.post<CreateAccountResponse>('/payments/account', {});
};

export const getPaymentAccount = async (): Promise<PaymentAccount> => {
  return apiClient.get<PaymentAccount>('/payments/account');
};


export const topUpBalance = async (data: TopUpRequest): Promise<TopUpResponse> => {
  return apiClient.post<TopUpResponse>('/payments/account/top-up', data);
};
