export interface PaymentAccount {
  id: string;
  userId: string;
  stripeCustomerId: string;
  balance: number; // in cents or UAH (depends on backend)
  currency: string;
  paymentMethods: PaymentMethod[];
  createdAt: string;
}

export interface PaymentMethod {
  id: string;
  type: string; // "card" | "paypal" | etc.
  card?: {
    brand: string;   // "visa" | "mastercard" | ...
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault?: boolean;
}

// ─── Top Up ────────────────────────────────────────────────────────────────

// ─── Top Up ────────────────────────────────────────────────────────────────

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
// ─── Create Account ────────────────────────────────────────────────────────

export interface CreateAccountResponse {
  id: string;
  stripeCustomerId: string;
  balance: number;
  currency: string;
}
