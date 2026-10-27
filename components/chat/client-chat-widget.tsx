"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageCircle,
  X,
  Send,
  CheckCheck,
  CheckCircle2,
  Sparkles,
} from "@/components/ui/icons";
import type { ChatMessage } from "@/types/chat";
import {
  subscribeToChatMessages,
  sendChatMessage,
  markChatThreadRead,
} from "@/lib/firestore/chat";

interface ClientChatWidgetProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  planGoal?: string;
  className?: string;
  initiallyOpen?: boolean;
  isOpenControlled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ClientChatWidget({
  userId,
  userName = "Valued Client",
  planGoal = "Personalized Transformation",
  className = "",
  initiallyOpen = false,
  isOpenControlled,
  onOpenChange,
}: ClientChatWidgetProps) {
  const [internalOpen, setInternalOpen] = useState<boolean>(initiallyOpen);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;

  const setIsOpen = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange?.(open);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [hasUnreadFromCoach, setHasUnreadFromCoach] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to real-time messages
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages(userId, (newMessages) => {
      setMessages(newMessages);

      // Check if there are unread coach messages
      const unreadCoach = newMessages.some((m) => m.senderRole === "coach" && !m.read);
      setHasUnreadFromCoach(unreadCoach);
    });

    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Mark messages read when user opens chat
  useEffect(() => {
    if (isOpen) {
      void markChatThreadRead(userId, "client");
      setHasUnreadFromCoach(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, userId, messages.length]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setInputText("");
      await sendChatMessage({
        userId,
        senderRole: "client",
        senderId: userId,
        senderName: userName,
        text: trimmed,
      });

      // Simulated instant coach acknowledgement if this is the first message
      if (messages.length <= 1) {
        setTimeout(async () => {
          await sendChatMessage({
            userId,
            senderRole: "coach",
            senderId: "coach_naveen",
            senderName: "Coach Naveen",
            text: `Noted, ${userName.split(" ")[0]}! I received your message. I am actively tailoring your upcoming week's meal and workout adjustments. Keep your water and protein logged!`,
          });
        }, 1500);
      }
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputText(question);
    inputRef.current?.focus();
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Just now";
    }
  };

  return (
    <>
      {/* ================= FLOATING LAUNCHER PILL ================= */}
      {!isOpen && (
        <div className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 animate-bounce-subtle ${className}`}>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 bg-[#075E54] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-emerald-400/40 group"
            aria-label="Open WhatsApp Chat with Coach Naveen"
          >
            {/* WhatsApp Green Badge Icon */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>
              {/* Online Pulse Indicator */}
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
            </div>

            {/* Label */}
            <div className="text-left pr-1 hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide">Coach Chat</span>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-400 text-gray-950 px-1.5 py-0.2 rounded-full">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">Message Coach Naveen directly</p>
            </div>

            {/* Unread indicator */}
            {hasUnreadFromCoach && (
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
            )}
          </button>
        </div>
      )}

      {/* ================= WHATSAPP STYLE CHAT WINDOW ================= */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-[400px] h-[580px] max-h-[85vh] bg-[#efeae2] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-300/80 animate-in fade-in zoom-in-95 duration-200">
          {/* Top Bar: WhatsApp Dark Green Theme */}
          <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              {/* Coach Avatar */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-emerald-400">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Coach Naveen"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#25D366] rounded-full border border-white" />
              </div>

              {/* Coach Details */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white leading-tight">Coach Naveen</h3>
                  <span className="text-[9px] bg-[#25D366] text-black font-black px-1.5 py-0.2 rounded-full">
                    VERIFIED
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium flex items-center gap-1 leading-tight">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse inline-block" />
                  <span>Head Nutritionist · Active Now</span>
                </p>
              </div>
            </div>

            {/* Actions: Info & Close */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sub-header Context Bar */}
          <div className="bg-[#128C7E] text-emerald-50 px-3.5 py-1.5 text-[11px] font-semibold flex items-center justify-between border-t border-emerald-600/30">
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">₹99 Transformation Plan · {planGoal}</span>
            </div>
            <span className="bg-emerald-950/40 text-emerald-200 px-2 py-0.5 rounded text-[10px] font-mono shrink-0">
              Direct Sync
            </span>
          </div>

          {/* Messages Container with WhatsApp Style Doodle Wallpaper */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{
              backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #efeae2 0.75px)`,
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 10px 10px",
            }}
          >
            {/* Encryption & Plan Notice Pill */}
            <div className="flex justify-center">
              <div className="bg-amber-100/90 text-amber-900 border border-amber-200/60 rounded-xl px-3 py-1.5 text-[10px] font-semibold text-center max-w-[90%] shadow-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  Direct 1-on-1 channel with Coach Naveen. Ask about meal swaps, weight logs, or workout tweaks.
                </span>
              </div>
            </div>

            {/* Date Pill */}
            <div className="flex justify-center">
              <span className="bg-white/90 text-gray-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                Today
              </span>
            </div>

            {/* Messages List */}
            {messages.map((msg) => {
              const isMe = msg.senderRole === "client";
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 shadow-xs relative text-left leading-relaxed ${
                      isMe
                        ? "bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-emerald-200/50"
                        : "bg-white text-gray-900 rounded-tl-xs border border-gray-200/60"
                    }`}
                  >
                    {/* Coach sender name label */}
                    {!isMe && (
                      <p className="text-[10px] font-black text-[#075E54] mb-0.5 flex items-center gap-1">
                        <span>{msg.senderName}</span>
                        <span className="text-[8px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">COACH</span>
                      </p>
                    )}

                    {/* Message content */}
                    <p className="text-xs font-medium text-gray-800 whitespace-pre-wrap">{msg.text}</p>

                    {/* Timestamp & Double Ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-500 font-mono">
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isMe && (
                        <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? "text-[#53bdeb]" : "text-gray-400"}`} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions Chips */}
          <div className="bg-[#f0f2f5] px-3 py-2 border-t border-gray-200 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0">Ask:</span>
            {[
              "⚖️ Logged my morning weight!",
              "🥗 Can I swap brown rice?",
              "💪 Leg workout soreness tip?",
              "💧 Finished 3.5L water target!",
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickQuestion(chip)}
                className="shrink-0 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 rounded-full px-2.5 py-1 text-[11px] font-medium transition shadow-xs active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSend} className="bg-[#f0f2f5] p-2.5 flex items-center gap-2 border-t border-gray-200">
            {/* Input field */}
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message to Coach Naveen..."
                className="w-full bg-white text-gray-900 text-xs rounded-full py-2.5 pl-4 pr-10 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent transition"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition shadow-md shrink-0 ${
                inputText.trim()
                  ? "bg-[#25D366] hover:bg-[#1faa53] text-white active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
