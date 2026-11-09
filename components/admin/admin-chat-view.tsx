"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  Send,
  CheckCheck,
  Sparkles,
  Edit3,
  Scale,
  MessageCircle,
} from "@/components/ui/icons";
import type { AdminUserRecord } from "@/types/admin";
import type { ChatMessage, ChatThread } from "@/types/chat";
import {
  subscribeToChatMessages,
  subscribeToChatThreads,
  sendChatMessage,
  markChatThreadRead,
  syncPurchasedUsersToChatThreads,
} from "@/lib/firestore/chat";

interface AdminChatViewProps {
  users: AdminUserRecord[];
  initialUserId?: string;
  onOpenStudio?: (user: AdminUserRecord) => void;
  onOpenBiometrics?: (user: AdminUserRecord) => void;
}

export function AdminChatView({
  users,
  initialUserId,
  onOpenStudio,
  onOpenBiometrics,
}: AdminChatViewProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || "");

  useEffect(() => {
    if (initialUserId) {
      setSelectedUserId(initialUserId);
    }
  }, [initialUserId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "purchased" | "free" | "unread">("all");
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Sync real users to chat threads (excluding Coach Naveen)
  useEffect(() => {
    if (users.length > 0) {
      const clientUsers = users
        .filter(
          (u) =>
            u.email?.toLowerCase() !== "bmyfitnesscoach@gmail.com" &&
            u.id !== "coach_naveen" &&
            u.name?.toLowerCase() !== "coach naveen"
        )
        .map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          goalDisplay: u.goalDisplay,
          membershipCategory: u.membershipCategory || "free",
        }));

      syncPurchasedUsersToChatThreads(clientUsers);
    }
  }, [users]);

  // 2. Subscribe to chat threads list
  useEffect(() => {
    const unsubscribe = subscribeToChatThreads((updatedThreads) => {
      setThreads(updatedThreads);
      if (!selectedUserId && updatedThreads.length > 0) {
        setSelectedUserId(updatedThreads[0].userId);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  // 3. Subscribe to active conversation messages
  useEffect(() => {
    if (!selectedUserId) return;

    void markChatThreadRead(selectedUserId, "coach");

    const unsubscribe = subscribeToChatMessages(selectedUserId, (newMsgs) => {
      setMessages(newMsgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  const matchedThread = threads.find((t) => t.userId === selectedUserId);
  const selectedUserRecord = users.find(
    (u) =>
      u.id === selectedUserId ||
      u.assessmentId === selectedUserId ||
      (matchedThread && (u.id === matchedThread.userId || u.assessmentId === matchedThread.userId))
  );

  const selectedThread: ChatThread | null =
    matchedThread ||
    (selectedUserRecord
      ? {
          userId: selectedUserRecord.id,
          userName: selectedUserRecord.name,
          userEmail: selectedUserRecord.email,
          userPhone: selectedUserRecord.phone,
          avatarUrl: selectedUserRecord.avatar,
          planGoal: selectedUserRecord.goalDisplay || "Custom Fitness Plan",
          membershipCategory: selectedUserRecord.membershipCategory || "free",
          lastMessageText: "New conversation",
          lastMessageAt: new Date().toISOString(),
          lastMessageSenderRole: "coach",
          unreadCountCoach: 0,
          unreadCountClient: 0,
          updatedAt: new Date().toISOString(),
        }
      : threads.length > 0
      ? threads[0]
      : null);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedThread?.userId || sending) return;

    try {
      setSending(true);
      setInputText("");
      await sendChatMessage({
        userId: selectedThread.userId,
        senderRole: "coach",
        senderId: "coach_naveen",
        senderName: "Coach Naveen",
        text,
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPreset = (preset: string) => {
    void handleSendMessage(preset);
  };

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    // Strictly exclude dummy/mock threads and coach self-thread
    if (
      !t.userName ||
      t.userName === "Client" ||
      t.userName.toLowerCase() === "coach naveen" ||
      t.userEmail?.toLowerCase() === "bmyfitnesscoach@gmail.com" ||
      t.userId.startsWith("user_membership_") ||
      t.userId.startsWith("user_purchased_") ||
      t.userId.startsWith("user_purchase_") ||
      t.userId.startsWith("mock_") ||
      t.userId === "coach_naveen"
    ) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.userName.toLowerCase().includes(q) ||
      t.userEmail.toLowerCase().includes(q) ||
      (t.userPhone && t.userPhone.includes(q)) ||
      (t.userId && t.userId.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === "purchased") {
      return t.membershipCategory === "purchased" || t.membershipCategory === "membership";
    }
    if (filterType === "free") {
      return t.membershipCategory === "free" || !t.membershipCategory;
    }
    if (filterType === "unread") {
      return t.unreadCountCoach > 0;
    }
    return true;
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const activeUserId = selectedThread ? selectedThread.userId : selectedUserId;
  const clientName = selectedThread?.userName || selectedUserRecord?.name || "Client";
  const firstName = clientName.split(" ")[0] || "Client";
  const clientEmail = selectedThread?.userEmail || selectedUserRecord?.email || "client@bmyfit.in";
  const clientPhone = selectedThread?.userPhone || selectedUserRecord?.phone || "+91 Mobile";
  const planGoal = selectedThread?.planGoal || selectedUserRecord?.goalDisplay || "Fitness Plan";
  const category = selectedThread?.membershipCategory || selectedUserRecord?.membershipCategory || "free";
  const avatarUrl = selectedThread?.avatarUrl || selectedUserRecord?.avatar;
  const initialLetter = (clientName.charAt(0) || "C").toUpperCase();
  const idSnippet = (selectedThread?.userId || "").slice(0, 10);

  return (
    <div className="flex-1 flex h-[calc(100vh-140px)] min-h-[620px] bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* ================= LEFT SIDEBAR: CLIENT THREADS LIST (WhatsApp Web Style) ================= */}
      <div className="w-80 lg:w-96 border-r border-gray-200/80 flex flex-col bg-gray-50/60 shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 bg-white border-b border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-emerald-600 border border-emerald-400">
                <Image
                  src="/images/coach-naveen-v4.jpg"
                  alt="Coach Naveen"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div>
                <h2 className="text-xs font-black text-gray-950 flex items-center gap-1.5">
                  <span>Client Messages</span>
                  <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                </h2>
                <p className="text-[10px] text-gray-500 font-medium">Head Coach Naveen Console</p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              WhatsApp Sync
            </span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients by name or phone..."
              className="w-full bg-gray-100/80 text-gray-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-transparent focus:bg-white focus:border-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterType === "all"
                  ? "bg-[#075E54] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({threads.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("purchased")}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterType === "purchased"
                  ? "bg-[#075E54] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              ₹99 Paid ({threads.filter((t) => t.membershipCategory === "purchased" || t.membershipCategory === "membership").length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("free")}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterType === "free"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Leads ({threads.filter((t) => t.membershipCategory === "free" || !t.membershipCategory).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unread")}
              className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                filterType === "unread"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredThreads.map((thread) => {
            const isSelected = thread.userId === activeUserId;
            const hasUnread = thread.unreadCountCoach > 0;
            const matchedUser = users.find(
              (u) =>
                u.id === thread.userId ||
                u.assessmentId === thread.userId ||
                (u.email && thread.userEmail && u.email.toLowerCase() === thread.userEmail.toLowerCase())
            );
            const userCategory = matchedUser?.membershipCategory || thread.membershipCategory || "free";
            const isPaid = userCategory === "purchased";
            const isMembership = userCategory === "membership";
            const displayGoal = matchedUser?.goalDisplay || thread.planGoal;

            return (
              <button
                key={thread.userId}
                type="button"
                onClick={() => setSelectedUserId(thread.userId)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition hover:bg-white cursor-pointer ${
                  isSelected ? "bg-emerald-50/80 border-l-4 border-l-[#075E54]" : "bg-transparent"
                }`}
              >
                {/* User Avatar */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-300/80">
                  {thread.avatarUrl ? (
                    <img src={thread.avatarUrl} alt={thread.userName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white font-bold text-xs">
                      {thread.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-bold text-xs text-gray-950 truncate">{thread.userName}</span>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">
                      {formatTime(thread.lastMessageAt)}
                    </span>
                  </div>

                  {/* Membership Category Badge (Accurate per User) */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {isPaid ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ₹99 PLAN ACTIVE
                      </span>
                    ) : isMembership ? (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
                        MEMBERSHIP
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                        FREE LEAD
                      </span>
                    )}
                    {displayGoal && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                        {displayGoal}
                      </span>
                    )}
                  </div>

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-gray-500 truncate font-medium">
                      {thread.lastMessageSenderRole === "coach" && (
                        <span className="text-gray-400 mr-1 font-semibold">You:</span>
                      )}
                      {thread.lastMessageText || "New conversation"}
                    </p>
                    {hasUnread && (
                      <span className="w-4 h-4 rounded-full bg-[#25D366] text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        {thread.unreadCountCoach}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No clients match your filter.
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT MAIN PANEL: ACTIVE WHATSAPP CHAT ================= */}
      {selectedThread ? (
        <div className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
          {/* Top Bar: Selected Client Header */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-xs z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-emerald-400 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={clientName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-800 text-white font-bold text-xs">
                    {initialLetter}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">{clientName}</h3>
                  {category === "purchased" ? (
                    <span className="text-[9px] bg-emerald-400 text-gray-950 font-black px-2 py-0.5 rounded-full">
                      ₹99 SUBSCRIBER
                    </span>
                  ) : category === "membership" ? (
                    <span className="text-[9px] bg-purple-300 text-purple-950 font-black px-2 py-0.5 rounded-full">
                      MEMBERSHIP
                    </span>
                  ) : (
                    <span className="text-[9px] bg-gray-200 text-gray-800 font-black px-2 py-0.5 rounded-full">
                      FREE INTAKE LEAD
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {clientEmail} · {clientPhone}
                </p>
              </div>
            </div>

            {/* Quick Actions to jump to WhatsApp Web, Studio, or Biometrics */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const rawPhone = clientPhone.replace(/\D/g, "") || "919800000000";
                  const phone = rawPhone.startsWith("91") ? rawPhone : `91${rawPhone}`;
                  const msg = encodeURIComponent(
                    `Hello ${firstName}! Coach Naveen here from BMYFIT. I'm reviewing your ${planGoal}. How are your workouts and meals going?`
                  );
                  window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
                }}
                className="bg-[#25D366] hover:bg-[#20bd5a] text-gray-950 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Open WhatsApp Web Conversation"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Open in WhatsApp</span>
              </button>

              {selectedUserRecord && onOpenBiometrics && (
                <button
                  type="button"
                  onClick={() => onOpenBiometrics(selectedUserRecord)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Biometrics</span>
                </button>
              )}
              {selectedUserRecord && onOpenStudio && (
                <button
                  type="button"
                  onClick={() => onOpenStudio(selectedUserRecord)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-gray-950 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit 8-W Plan</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Container with WhatsApp Background */}
          <div
            className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3"
            style={{
              backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #efeae2 0.75px)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {/* Context Pill */}
            <div className="flex justify-center">
              <span className="bg-white/95 text-gray-700 text-[11px] font-bold px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1.5 border border-gray-200/60">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-on-1 Consultation Thread for {clientName} (ID: {idSnippet})</span>
              </span>
            </div>

            {/* Date Pill */}
            <div className="flex justify-center">
              <span className="bg-white/90 text-gray-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                Conversation History
              </span>
            </div>

            {/* Messages */}
            {messages.map((msg) => {
              const isCoach = msg.senderRole === "coach";
              return (
                <div key={msg.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl p-3.5 shadow-xs relative text-left leading-relaxed ${
                      isCoach
                        ? "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-200/50"
                        : "bg-white text-gray-900 rounded-tl-xs border border-gray-200/70"
                    }`}
                  >
                    {!isCoach && (
                      <p className="text-[10px] font-black text-emerald-800 mb-0.5">
                        {msg.senderName || clientName}
                      </p>
                    )}
                    {isCoach && (
                      <p className="text-[10px] font-black text-[#075E54] mb-0.5">Coach Naveen</p>
                    )}

                    <p className="text-xs font-medium text-gray-800 whitespace-pre-wrap">{msg.text}</p>

                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 font-mono">
                      <span>{formatTime(msg.createdAt)}</span>
                      {isCoach && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-[#53bdeb]" : "text-gray-400"}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Presets Row for Coach Naveen */}
          <div className="bg-[#f0f2f5] px-4 py-2 border-t border-gray-200/90 overflow-x-auto flex items-center gap-2 scrollbar-none shrink-0">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider shrink-0">
              Quick Coach Replies:
            </span>
            {[
              "Biometrics reviewed! Protein targets updated in Week 1.",
              "Great progress on your daily logs! Keep hydration above 3.5L.",
              "Please share your updated morning weigh-in.",
              "Reviewed your medical note. Lower back safe exercises are in your plan.",
              "Your next week's meal roadmap is ready!",
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className="shrink-0 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-gray-200 rounded-full px-3 py-1 text-[11px] font-medium transition shadow-xs active:scale-95 cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSendMessage();
            }}
            className="bg-[#f0f2f5] p-3 flex items-center gap-3 border-t border-gray-200/90 shrink-0"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a coaching message to ${firstName}...`}
                className="w-full bg-white text-gray-900 text-xs rounded-full py-2.5 pl-4 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shrink-0 ${
                inputText.trim()
                  ? "bg-[#25D366] hover:bg-[#1faa53] text-white active:scale-95 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Send Message"
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-8 space-y-2">
          <MessageCircle className="w-12 h-12 text-gray-300" />
          <p className="text-sm font-bold text-gray-600">Select a client thread to start chatting</p>
          <p className="text-xs text-gray-400">All registered clients and free leads appear in the left list.</p>
        </div>
      )}
    </div>
  );
}
