"use client";

// app/admin/orders/page.tsx
//
// Admin panel at /admin/orders. Only Firebase Auth users with a custom
// claim `admin: true` can see anything here (set via scripts/setAdminClaim.js).
// The admin's job: open your actual PhonePe Business app / bank statement,
// check that the amount and UTR a customer submitted really match a real
// payment you received, then click "Mark verified".

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection, onSnapshot, orderBy, query, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

interface AdminOrder {
  id: string;
  customerName?: string;
  customerPhone?: string;
  amount?: number | string;
  upiTransactionId?: string;
  status: string;
  createdAt?: unknown;
  verifiedAt?: unknown;
  verifiedBy?: string | null;
}

export default function AdminOrdersPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined); // undefined = loading, null = signed out
  const [isAdmin, setIsAdmin] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState("submitted");

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const tokenResult = await u.getIdTokenResult();
          setIsAdmin(Boolean(tokenResult.claims.admin));
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdminOrder))));
  }, [isAdmin]);

  async function setStatus(orderId: string, status: string) {
    await updateDoc(doc(db, "orders", orderId), {
      status,
      verifiedAt: serverTimestamp(),
      verifiedBy: auth.currentUser?.uid || null,
    });
  }

  if (user === undefined) return <p className="p-6">Loading…</p>;
  if (!user) return <SignInForm />;
  if (!isAdmin) return <p className="p-6">Signed in, but this account isn&apos;t an admin.</p>;

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100">
            ← Admin Console &amp; Funnel
          </Link>
          <h1 className="text-xl font-semibold">Orders &amp; Payments</h1>
        </div>
        <button onClick={() => void signOut(auth)} className="text-sm text-gray-500 underline cursor-pointer">
          Sign out
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {["submitted", "verified", "rejected", "pending", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === f ? "bg-gray-900 text-white" : "bg-white text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div>
              <div className="font-medium">{o.customerName} · ₹{o.amount}</div>
              <div className="text-sm text-gray-500">{o.customerPhone}</div>
              <div className="mt-1 text-sm">
                UTR: <span className="font-mono">{o.upiTransactionId || "— not submitted yet —"}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">Order {o.id} · {o.status}</div>
            </div>
            {o.status === "submitted" && (
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => void setStatus(o.id, "verified")}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white cursor-pointer hover:bg-emerald-700 transition"
                >
                  Mark verified
                </button>
                <button
                  onClick={() => void setStatus(o.id, "rejected")}
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 cursor-pointer hover:bg-red-100 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {visible.length === 0 && <p className="text-sm text-gray-500">Nothing here.</p>}
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Wrong email or password.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-24 max-w-sm space-y-3 p-6">
      <h1 className="text-lg font-semibold">Admin sign in</h1>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full rounded-md border px-3 py-2"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="w-full rounded-md border px-3 py-2"
      />
      <button className="w-full rounded-md bg-gray-900 py-2 text-white font-bold cursor-pointer">Sign in</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

