import { z } from "zod";

export const createOrderSchema = z
  .object({
    assessmentId: z.string().min(1, "assessmentId is required").max(200),
  })
  .strict();

export const verifyPaymentSchema = z
  .object({
    razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9_-]{1,100}$/, "Invalid Razorpay order ID"),
    razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9_-]{1,100}$/, "Invalid Razorpay payment ID"),
    razorpay_signature: z.string().regex(/^[a-fA-F0-9]{64}$/, "Invalid signature format"),
  })
  .strict();

export const paymentSchema = verifyPaymentSchema;
export const paymentDetailsSchema = paymentSchema;

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
