// Зміни шлях до apiClient.ts на свій реальний, якщо вони лежать у різних папках
import type {
  CreateAccountResponse,
  PaymentAccount,
  TopUpRequest,
  TopUpResponse
} from "../types.ts";
import {apiClient} from "../../../services/apiClient.ts";

// ─── Create Payment Account ────────────────────────────────────────────────
export const createPaymentAccount = async (): Promise<CreateAccountResponse> => {
  return apiClient.post<CreateAccountResponse>('/payments/account', {});
};

// ─── Get Payment Account ───────────────────────────────────────────────────
export const getPaymentAccount = async (): Promise<PaymentAccount> => {
  return apiClient.get<PaymentAccount>('/payments/account');
};

// ─── Top Up Balance ────────────────────────────────────────────────────────
export const topUpBalance = async (data: TopUpRequest): Promise<TopUpResponse> => {
  return apiClient.post<TopUpResponse>('/payments/account/top-up', data);
};
