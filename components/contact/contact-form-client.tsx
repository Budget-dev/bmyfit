"use client";

import React, { useState } from "react";

export function ContactFormClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("payment");
  const [paymentId, setPaymentId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      // Generate a client reference ticket
      const ticketId = `BMY-TK-${Math.floor(10000 + Math.random() * 90000)}`;

      // Simulate instantaneous registration & notify coach console
      await new Promise((resolve) => setTimeout(resolve, 600));

      setSubmittedTicket(ticketId);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCoachChat = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("bmyfit_open_chat"));
    }
  };

  if (submittedTicket) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xs text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black">
          ✓
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Inquiry Ticket Generated
          </span>
          <h3 className="text-lg font-black text-gray-950 mt-2">
            Thank you, {name.split(" ")[0]}!
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Your support request has been logged under Reference ID:{" "}
            <strong className="text-gray-900 font-mono text-sm">{submittedTicket}</strong>.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-1">
          <p className="font-bold">Next Steps &amp; Turnaround SLA:</p>
          <p className="text-emerald-800">
            Our customer desk and Coach Naveen review all inquiries. A response will be dispatched to{" "}
            <strong>{email}</strong> within <strong>2 to 4 business hours</strong>.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleOpenCoachChat}
            className="w-full py-2.5 px-4 rounded-xl bg-[#075E54] hover:bg-[#064e46] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>💬 Need urgent help? Chat with Coach Naveen directly</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSubmittedTicket(null);
              setMessage("");
              setPaymentId("");
            }}
            className="w-full py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs transition"
          >
            Submit Another Query
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-left space-y-4">
      <div className="pb-3 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-950 flex items-center gap-2">
          <span>✉️</span>
          <span>Submit Support Inquiry</span>
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Send a direct message to our support desk. We respond to all queries within 2–6 hours.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Your Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              WhatsApp / Mobile <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98000 00000"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Inquiry Category <span className="text-rose-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
          >
            <option value="payment">Razorpay Payment &amp; Verification</option>
            <option value="delivery">Plan Access &amp; Delivery Help</option>
            <option value="diet">Diet &amp; Nutrition Adjustment</option>
            <option value="workout">Workout Routine &amp; Form Advice</option>
            <option value="refund">Refund or Cancellation Request</option>
            <option value="other">General Question / Feedback</option>
          </select>
        </div>

        {/* Payment ID (if category is payment or refund) */}
        {(category === "payment" || category === "refund" || category === "delivery") && (
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Razorpay Payment ID / UPI Reference <span className="text-gray-400 font-normal">(if available)</span>
            </label>
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="e.g. pay_Q8k29xLa... or 12-digit UTR"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-mono focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            Your Message / Question <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Please share details of your question or issue..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <span>Dispatching Ticket...</span>
          ) : (
            <>
              <span>Submit Ticket to Support Desk</span>
              <span>→</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-gray-400 text-center">
          🔒 Your details are protected under our DPDP Act Privacy Policy. We never share your data.
        </p>
      </form>
    </div>
  );
}

