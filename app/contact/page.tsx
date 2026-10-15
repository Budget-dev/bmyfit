import type { Metadata } from "next";
import { FunnelShell } from "@/components/layout/funnel-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact Us - BMYFIT Support & Inquiries",
  description: "Contact BMYFIT customer support for payment inquiries, plan delivery assistance, or general feedback.",
};

export default function ContactPage() {
  return (
    <FunnelShell>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3 text-center sm:text-left">
          <Badge variant="neutral">Support & Help Desk</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-neutral-100">
            Contact Us
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Have questions about your ₹99 assessment, plan delivery, or need assistance? Our team is here to help.
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink dark:text-neutral-100">
              Customer Support Email
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              For any queries regarding your personalized plan delivery, billing, or technical issues:
            </p>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block mb-1">
                Direct Email
              </span>
              <a
                href="mailto:support@bmyfit.in"
                className="text-base font-semibold text-brand-emerald hover:underline"
              >
                support@bmyfit.in
              </a>
              <span className="text-xs text-neutral-500 block mt-1">
                Average response time: Within 4 to 24 business hours.
              </span>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink dark:text-neutral-100">
              Payment Inquiries (Razorpay)
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              If an amount of ₹99 was debited from your account or UPI handle but your plan did not unlock immediately:
            </p>
            <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-2 list-disc list-inside">
              <li>Wait 2–5 minutes for our webhook listener to confirm status.</li>
              <li>Check your email inbox or refresh your session.</li>
              <li>
                If still locked, email <strong className="text-ink dark:text-neutral-200">support@bmyfit.in</strong> with your Razorpay Payment ID (<code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">pay_...</code>) or UPI Reference Number (UTR). We will verify and unlock your plan immediately.
              </li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-ink dark:text-neutral-100">
              Operating Location & Grievance
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              <strong>BMYFIT Health Technologies</strong><br />
              Bengaluru, Karnataka, India<br />
              Grievance Officer: Support Desk (<a href="mailto:grievance@bmyfit.in" className="text-brand-emerald underline">grievance@bmyfit.in</a>)
            </p>
          </Card>
        </div>
      </div>
    </FunnelShell>
  );
}
