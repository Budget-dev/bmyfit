import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment credentials are not configured on server" },
        { status: 401 }
      );
    }

    let body: {
      amount?: number;
      currency?: string;
      receipt?: string;
      notes?: Record<string, string>;
    } = {};

    try {
      body = await request.json();
    } catch {
      // Allow empty body to use defaults
    }

    // Amount in paise (e.g. 9900 paise = Rs. 99). Minimum allowed is 100 paise (Rs. 1.00)
    const amount = Number(body.amount ?? 9900);
    const currency = body.currency || "INR";
    const receipt = (body.receipt || `rcpt_${Date.now()}`).slice(0, 40);

    if (isNaN(amount) || amount < 100) {
      return NextResponse.json(
        { error: "Invalid amount: must be at least 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency,
      receipt,
      notes: body.notes || {
        service: "BMYFIT Custom Plan",
      },
    });

    if (!order || !order.id) {
      return NextResponse.json(
        { error: "Failed to create order with Razorpay" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; error?: { description?: string }; message?: string };
    console.error("[Razorpay create-order error]:", err);
    return NextResponse.json(
      {
        error: err.error?.description || err.message || "Failed to create order with Razorpay gateway",
      },
      { status: err.statusCode || 500 }
    );
  }
}

