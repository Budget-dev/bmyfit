import { z } from "zod";
import { AppError, toErrorResponse } from "@/lib/errors";
import { generateDevSandboxPaymentSignature, isRazorpayConfigured } from "@/lib/payments/razorpay";

export const runtime = "nodejs";

const requestSchema = z.object({
  orderId: z.string().min(1).max(200),
  paymentId: z.string().min(1).max(200),
});

/**
 * Development-only endpoint to generate a genuine HMAC SHA-256 signature
 * for sandbox payment verification testing without exposing secrets to client.
 */
export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === "production" || isRazorpayConfigured()) {
      throw new AppError("NOT_FOUND", "Sandbox helper is disabled in this environment", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("INVALID_REQUEST", "Invalid request body", 400);
    }

    const { orderId, paymentId } = requestSchema.parse(body);
    const signature = generateDevSandboxPaymentSignature(orderId, paymentId);

    return Response.json({
      orderId,
      paymentId,
      signature,
      algorithm: "HMAC-SHA256",
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
