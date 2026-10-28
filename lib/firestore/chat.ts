"use client";

import type { ChatMessage, ChatThread, ChatSenderRole } from "@/types/chat";
import {
  db,
  doc,
  collection,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "@/lib/firebase/client";

// Live in-memory cache for instant UI response and Firestore sync
const inMemoryMessages = new Map<string, ChatMessage[]>();
const inMemoryThreads = new Map<string, ChatThread>();

// Custom Event bus for real-time local sync across components
const CHAT_UPDATE_EVENT = "bmyfit_chat_updated";

function notifyChatUpdated(userId: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHAT_UPDATE_EVENT, { detail: { userId } }));
  }
}

/**
 * Subscribe to messages in a user's chat thread
 */
export function subscribeToChatMessages(
  userId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  seedInitialChatData();

  // If userId doesn't exist yet (e.g. newly registered user or "local"), create default greeting
  if (!inMemoryMessages.has(userId)) {
    const greeting: ChatMessage = {
      id: `msg_welcome_${userId}`,
      userId,
      senderId: "coach_naveen",
      senderRole: "coach",
      senderName: "Coach Naveen",
      text: "Namaste! I am Coach Naveen, your dedicated Head Coach & Nutritionist at BMYFIT. I am reviewing your biometrics and tailoring your custom weekly roadmap. Feel free to ask me anything here anytime!",
      createdAt: new Date().toISOString(),
      read: true,
    };
    inMemoryMessages.set(userId, [greeting]);

    const initialThread: ChatThread = {
      userId,
      userName: "Client",
      userEmail: "client@bmyfit.com",
      planGoal: "Custom Transformation",
      membershipCategory: "purchased",
      lastMessageText: greeting.text,
      lastMessageAt: greeting.createdAt,
      lastMessageSenderRole: "coach",
      unreadCountCoach: 0,
      unreadCountClient: 0,
      updatedAt: greeting.createdAt,
    };
    inMemoryThreads.set(userId, initialThread);
  }

  // Initial callback with in-memory data
  callback(inMemoryMessages.get(userId) || []);

  // Listen to local event updates
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<{ userId: string }>;
    if (!customEvent.detail || customEvent.detail.userId === userId) {
      callback(inMemoryMessages.get(userId) || []);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener(CHAT_UPDATE_EVENT, handleLocalUpdate);
  }

  // Listen to Firestore real-time collection: chats/{userId}/messages
  let unsubscribeFirestore = () => {};
  try {
    const messagesRef = collection(db, "chats", userId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    unsubscribeFirestore = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteMsgs: ChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteMsgs.push({
              id: docSnap.id,
              userId: data.userId || userId,
              senderId: data.senderId,
              senderRole: data.senderRole,
              senderName: data.senderName,
              text: data.text,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
              read: data.read ?? false,
            });
          });

          // Merge remote with local messages
          inMemoryMessages.set(userId, remoteMsgs);
          callback(remoteMsgs);
        }
      },
      (error) => {
        // Silently keep using local/mock store if permission or network error
        console.warn("Firestore messages snapshot warning (using local fallback):", error.message);
      }
    );
  } catch (err) {
    console.warn("Firestore chat subscription initialization warning:", err);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(CHAT_UPDATE_EVENT, handleLocalUpdate);
    }
    unsubscribeFirestore();
  };
}

/**
 * Send a chat message
 */
export async function sendChatMessage(params: {
  userId: string;
  senderRole: ChatSenderRole;
  senderId: string;
  senderName: string;
  text: string;
}): Promise<ChatMessage> {
  const { userId, senderRole, senderId, senderName, text } = params;
  seedInitialChatData();

  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newMessage: ChatMessage = {
    id: msgId,
    userId,
    senderId,
    senderRole,
    senderName,
    text: text.trim(),
    createdAt: now,
    read: false,
  };

  // 1. Update inMemory messages
  const existingMsgs = inMemoryMessages.get(userId) || [];
  inMemoryMessages.set(userId, [...existingMsgs, newMessage]);

  // 2. Update thread metadata
  const existingThread = inMemoryThreads.get(userId) || {
    userId,
    userName: senderRole === "client" ? senderName : "Client",
    userEmail: "",
    membershipCategory: "purchased",
    unreadCountCoach: 0,
    unreadCountClient: 0,
    updatedAt: now,
  };

  const updatedThread: ChatThread = {
    ...existingThread,
    lastMessageText: newMessage.text,
    lastMessageAt: now,
    lastMessageSenderRole: senderRole,
    unreadCountCoach: senderRole === "client" ? (existingThread.unreadCountCoach || 0) + 1 : 0,
    unreadCountClient: senderRole === "coach" ? (existingThread.unreadCountClient || 0) + 1 : 0,
    updatedAt: now,
  };
  inMemoryThreads.set(userId, updatedThread);

  // Notify local components immediately
  notifyChatUpdated(userId);

  // 3. Persist to Cloud Firestore in the background
  try {
    const threadDocRef = doc(db, "chats", userId);
    const messageDocRef = doc(db, "chats", userId, "messages", msgId);

    void setDoc(
      messageDocRef,
      {
        ...newMessage,
        timestamp: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {});

    void setDoc(
      threadDocRef,
      {
        userId,
        userName: updatedThread.userName,
        lastMessageText: newMessage.text,
        lastMessageAt: now,
        lastMessageSenderRole: senderRole,
        unreadCountCoach: updatedThread.unreadCountCoach,
        unreadCountClient: updatedThread.unreadCountClient,
        updatedAt: now,
      },
      { merge: true }
    ).catch(() => {});
  } catch (err) {
    console.warn("Firestore chat push fallback notice:", err);
  }

  return newMessage;
}

/**
 * Mark messages in a thread as read
 */
export async function markChatThreadRead(
  userId: string,
  readerRole: "client" | "coach"
): Promise<void> {
  const thread = inMemoryThreads.get(userId);
  if (thread) {
    if (readerRole === "coach") {
      thread.unreadCountCoach = 0;
    } else {
      thread.unreadCountClient = 0;
    }
    inMemoryThreads.set(userId, { ...thread });
  }

  const msgs = inMemoryMessages.get(userId);
  if (msgs) {
    let changed = false;
    msgs.forEach((m) => {
      if (m.senderRole !== readerRole && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      inMemoryMessages.set(userId, [...msgs]);
      notifyChatUpdated(userId);
    }
  }

  try {
    const threadDocRef = doc(db, "chats", userId);
    void setDoc(
      threadDocRef,
      readerRole === "coach" ? { unreadCountCoach: 0 } : { unreadCountClient: 0 },
      { merge: true }
    ).catch(() => {});
  } catch {}
}

/**
 * Subscribe to all chat threads (used in Coach Admin Console)
 */
export function subscribeToChatThreads(callback: (threads: ChatThread[]) => void): () => void {
  seedInitialChatData();

  const getSortedThreads = () => {
    return Array.from(inMemoryThreads.values()).sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.updatedAt).getTime();
      const timeB = new Date(b.lastMessageAt || b.updatedAt).getTime();
      return timeB - timeA;
    });
  };

  callback(getSortedThreads());

  const handleUpdate = () => {
    callback(getSortedThreads());
  };

  if (typeof window !== "undefined") {
    window.addEventListener(CHAT_UPDATE_EVENT, handleUpdate);
  }

  let unsubscribeFirestore = () => {};
  try {
    const chatsCol = collection(db, "chats");
    unsubscribeFirestore = onSnapshot(
      chatsCol,
      (snapshot) => {
        if (!snapshot.empty) {
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const existing = inMemoryThreads.get(docSnap.id);
            if (existing) {
              inMemoryThreads.set(docSnap.id, {
                ...existing,
                ...data,
                userId: docSnap.id,
              });
            } else {
              inMemoryThreads.set(docSnap.id, {
                userId: docSnap.id,
                userName: data.userName || "Client",
                userEmail: data.userEmail || "",
                lastMessageText: data.lastMessageText || "",
                lastMessageAt: data.lastMessageAt || new Date().toISOString(),
                unreadCountCoach: data.unreadCountCoach || 0,
                unreadCountClient: data.unreadCountClient || 0,
                updatedAt: data.updatedAt || new Date().toISOString(),
              });
            }
          });
          callback(getSortedThreads());
        }
      },
      (error) => {
        console.warn("Firestore chats collection warning:", error.message);
      }
    );
  } catch {}

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener(CHAT_UPDATE_EVENT, handleUpdate);
    }
    unsubscribeFirestore();
  };
}

/**
 * Synchronize all ₹99 purchased users into chat threads so Coach can message all of them immediately
 */
export function syncPurchasedUsersToChatThreads(
  users: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    goalDisplay?: string;
    membershipCategory?: "purchased" | "membership" | "free";
  }>
) {
  seedInitialChatData();
  let added = false;

  users.forEach((u) => {
    if (!inMemoryThreads.has(u.id)) {
      const newThread: ChatThread = {
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        userPhone: u.phone,
        avatarUrl: u.avatar,
        planGoal: u.goalDisplay || "Custom Fitness Plan",
        membershipCategory: u.membershipCategory || "purchased",
        lastMessageText: "Plan created. Click here to chat with client.",
        lastMessageAt: new Date().toISOString(),
        lastMessageSenderRole: "coach",
        unreadCountCoach: 0,
        unreadCountClient: 0,
        updatedAt: new Date().toISOString(),
      };
      inMemoryThreads.set(u.id, newThread);
      added = true;
    }
  });

  if (added) {
    notifyChatUpdated("all");
  }
}

