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
  onOpenStudio?: (user: AdminUserRecord) => void;
  onOpenBiometrics?: (user: AdminUserRecord) => void;
}

export function AdminChatView({
  users,
  onOpenStudio,
  onOpenBiometrics,
}: AdminChatViewProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "purchased" | "unread">("all");
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Sync all purchased users to chat threads
  useEffect(() => {
    if (users.length > 0) {
      syncPurchasedUsersToChatThreads(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          goalDisplay: u.goalDisplay,
          membershipCategory: u.membershipCategory,
        }))
      );
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
      }, 50);
    });

    return () => {
      unsubscribe();
    };
  }, [selectedUserId]);

  const selectedThread = threads.find((t) => t.userId === selectedUserId) || threads[0];
  const selectedUserRecord = users.find((u) => u.id === selectedUserId);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedUserId || sending) return;

    try {
      setSending(true);
      setInputText("");
      await sendChatMessage({
        userId: selectedUserId,
        senderRole: "coach",
        senderId: "coach_naveen",
        senderName: "Coach Naveen",
        text,
      });
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    } finally {
      setSending(false);
    }
  };

  const handleQuickPreset = (preset: string) => {
    void handleSendMessage(preset);
  };

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.userPhone && t.userPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterType === "purchased") {
      return t.membershipCategory === "purchased" || true;
    }
    if (filterType === "unread") {
      return t.unreadCountCoach > 0;
    }
    return true;
  });

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex-1 flex h-[calc(100vh-130px)] bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
      {/* ================= LEFT SIDEBAR: CLIENT THREADS LIST (WhatsApp Web Style) ================= */}
      <div className="w-80 lg:w-96 border-r border-gray-200/80 flex flex-col bg-gray-50/60">
        {/* Sidebar Header */}
        <div className="p-4 bg-white border-b border-gray-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-emerald-600 border border-emerald-400">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Coach Naveen"
                  fill
                  className="object-cover"
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
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-3 py-1 rounded-lg transition ${filterType === "all"
                  ? "bg-[#075E54] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              All Clients ({threads.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("purchased")}
              className={`px-3 py-1 rounded-lg transition ${filterType === "purchased"
                  ? "bg-[#075E54] text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              ₹99 Paid
            </button>
            <button
              type="button"
              onClick={() => setFilterType("unread")}
              className={`px-3 py-1 rounded-lg transition ${filterType === "unread"
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
            const isSelected = thread.userId === selectedUserId;
            const hasUnread = thread.unreadCountCoach > 0;

            return (
              <button
                key={thread.userId}
                type="button"
                onClick={() => setSelectedUserId(thread.userId)}
                className={`w-full text-left p-3.5 flex items-start gap-3 transition hover:bg-white ${isSelected ? "bg-emerald-50/70 border-l-4 border-l-[#075E54]" : "bg-transparent"
                  }`}
              >
                {/* User Avatar */}
                <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-200 shrink-0 border border-gray-300/80">
                  {thread.avatarUrl ? (
                    <Image src={thread.avatarUrl} alt={thread.userName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-700 text-white font-bold text-xs">
                      {thread.userName.charAt(0)}
                    </div>
                  )}
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
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

                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      ₹99 PLAN ACTIVE
                    </span>
                    {thread.planGoal && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                        {thread.planGoal}
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
          <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-xs z-10">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-emerald-400">
                {selectedThread.avatarUrl ? (
                  <Image src={selectedThread.avatarUrl} alt={selectedThread.userName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-800 text-white font-bold text-xs">
                    {selectedThread.userName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white">{selectedThread.userName}</h3>
                  <span className="text-[9px] bg-emerald-400 text-gray-950 font-black px-2 py-0.2 rounded-full">
                    ₹99 SUBSCRIBER
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {selectedThread.userEmail || "client@bmyfit.com"} · {selectedThread.userPhone || "+91 Mobile"}
                </p>
              </div>
            </div>

            {/* Quick Actions to jump to Studio or Biometrics */}
            <div className="flex items-center gap-2">
              {selectedUserRecord && onOpenBiometrics && (
                <button
                  type="button"
                  onClick={() => onOpenBiometrics(selectedUserRecord)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Biometrics</span>
                </button>
              )}
              {selectedUserRecord && onOpenStudio && (
                <button
                  type="button"
                  onClick={() => onOpenStudio(selectedUserRecord)}
                  className="bg-emerald-400 hover:bg-emerald-300 text-gray-950 text-xs font-black px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
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
                <span>Active 1-on-1 Consultation Thread with Coach Naveen</span>
              </span>
            </div>

            {/* Date Pill */}
            <div className="flex justify-center">
              <span className="bg-white/90 text-gray-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                Today
              </span>
            </div>

            {/* Messages */}
            {messages.map((msg) => {
              const isCoach = msg.senderRole === "coach";
              return (
                <div key={msg.id} className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[78%] rounded-2xl p-3.5 shadow-xs relative text-left leading-relaxed ${isCoach
                        ? "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-200/50"
                        : "bg-white text-gray-900 rounded-tl-xs border border-gray-200/70"
                      }`}
                  >
                    {!isCoach && (
                      <p className="text-[10px] font-black text-emerald-800 mb-0.5">
                        {msg.senderName || selectedThread.userName}
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
          <div className="bg-[#f0f2f5] px-4 py-2 border-t border-gray-200/90 overflow-x-auto flex items-center gap-2 scrollbar-none">
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
                className="shrink-0 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-gray-200 rounded-full px-3 py-1 text-[11px] font-medium transition shadow-xs active:scale-95"
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
            className="bg-[#f0f2f5] p-3 flex items-center gap-3 border-t border-gray-200/90"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type a coaching message to ${selectedThread.userName.split(" ")[0]}...`}
                className="w-full bg-white text-gray-900 text-xs rounded-full py-2.5 pl-4 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shrink-0 ${inputText.trim()
                  ? "bg-[#25D366] hover:bg-[#1faa53] text-white active:scale-95"
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
          <p className="text-sm font-bold text-gray-600">Select a purchased client to start chatting</p>
          <p className="text-xs text-gray-400">All ₹99 clients appear in the left list.</p>
        </div>
      )}
    </div>
  );
}
