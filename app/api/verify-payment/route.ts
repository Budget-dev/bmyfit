import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      return NextResponse.json(
        { error: "Payment credentials are not configured on server" },
        { status: 401 }
      );
    }

    let body: {
      order_id?: string;
      razorpay_order_id?: string;
      payment_id?: string;
      razorpay_payment_id?: string;
      signature?: string;
      razorpay_signature?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const orderId = body.order_id || body.razorpay_order_id;
    const paymentId = body.payment_id || body.razorpay_payment_id;
    const signature = body.signature || body.razorpay_signature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          error: "Missing required fields: order_id, payment_id, and signature are required",
        },
        { status: 400 }
      );
    }

    // Razorpay standard verification formula: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const actualBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== actualBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed: Signature mismatch",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order_id: orderId,
      payment_id: paymentId,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[Razorpay verify-payment error]:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error during verification" },
      { status: 500 }
    );
  }
}

