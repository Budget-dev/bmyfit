export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export interface PaymentOrderRecord {
  id: string;
  uid: string;
  assessmentId: string;
  amountPaise: number;
  currency: "INR";
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  idempotencyKey: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  paidAt?: unknown;
}

export interface CreateOrderRequest {
  assessmentId: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: "INR";
  keyId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  assessmentId: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: VerifyPaymentRequest) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}
