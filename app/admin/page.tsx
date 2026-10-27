import React from "react";
import type { Metadata } from "next";
import { AdminDesktopConsole } from "@/components/admin/admin-desktop-console";
import { AdminLoginGuard } from "@/components/admin/admin-login-guard";

export const metadata: Metadata = {
  title: "BMYFIT Coach Admin Console · Desktop Management",
  description: "Comprehensive desktop admin panel for user biometrics inspection, multi-week plan customization, and direct dashboard pushing.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminLoginGuard>
      <AdminDesktopConsole />
    </AdminLoginGuard>
  );
}
