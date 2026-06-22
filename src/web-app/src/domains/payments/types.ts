export interface PaymentAccount {
  id: string;
  userId: string;
  stripeCustomerId: string;
  balance: number;
  currency: string;
  paymentMethods: PaymentMethod[];
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault?: boolean;
}


export interface TopUpRequest {
  amount: number;
  payment_method_id: string;
}

export interface TopUpResponse {
  stripe_payment_intent_id: string;
  status: string;
  amount_added: number;
  new_balance: number;
}

export interface CreateAccountResponse {
  id: string;
  stripeCustomerId: string;
  balance: number;
  currency: string;
}
