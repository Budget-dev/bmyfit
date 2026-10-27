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

// In-memory runtime storage for instant UI response and local development fallback
const inMemoryMessages = new Map<string, ChatMessage[]>();
const inMemoryThreads = new Map<string, ChatThread>();

// Default realistic initial messages for purchased clients
const INITIAL_DEMO_CHATS: Record<string, { thread: ChatThread; messages: ChatMessage[] }> = {
  user_purchased_01: {
    thread: {
      userId: "user_purchased_01",
      userName: "Rahul Sharma",
      userEmail: "rahul.sharma@gmail.com",
      userPhone: "+91 98201 44821",
      planGoal: "Fat Loss & Metabolic Reset",
      membershipCategory: "purchased",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      lastMessageText: "Great job completing Day 3 Rahul! Let's drop weight by 5kg on deadlifts to protect your lumbar spine.",
      lastMessageAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      lastMessageSenderRole: "coach",
      unreadCountCoach: 0,
      unreadCountClient: 1,
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    messages: [
      {
        id: "msg_rs_01",
        userId: "user_purchased_01",
        senderId: "user_purchased_01",
        senderRole: "client",
        senderName: "Rahul Sharma",
        text: "Hey Coach Naveen! I completed the Day 2 upper body workout yesterday and felt great energy throughout.",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg_rs_02",
        userId: "user_purchased_01",
        senderId: "coach_naveen",
        senderRole: "coach",
        senderName: "Coach Naveen",
        text: "Awesome consistency Rahul! How did the post-workout hydration and 135g protein target go?",
        createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg_rs_03",
        userId: "user_purchased_01",
        senderId: "user_purchased_01",
        senderRole: "client",
        senderName: "Rahul Sharma",
        text: "I finished the Day 3 session today, but felt a slight stiffness in my lower back during deadlifts. Should I reduce the weight?",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg_rs_04",
        userId: "user_purchased_01",
        senderId: "coach_naveen",
        senderRole: "coach",
        senderName: "Coach Naveen",
        text: "Great job completing Day 3 Rahul! Let's drop weight by 5kg on deadlifts to protect your lumbar spine. I reviewed your MRI note — stick to Romanian deadlifts with neutral spine. Keep up the great work!",
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
      },
    ],
  },
  user_purchased_02: {
    thread: {
      userId: "user_purchased_02",
      userName: "Ananya Roy",
      userEmail: "ananya.roy@yahoo.co.in",
      userPhone: "+91 97412 88390",
      planGoal: "Muscle Gain & Posture",
      membershipCategory: "purchased",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      lastMessageText: "Hi Coach, can I replace almond milk with oat milk in my evening smoothie?",
      lastMessageAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      lastMessageSenderRole: "client",
      unreadCountCoach: 1,
      unreadCountClient: 0,
      updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    },
    messages: [
      {
        id: "msg_ar_01",
        userId: "user_purchased_02",
        senderId: "coach_naveen",
        senderRole: "coach",
        senderName: "Coach Naveen",
        text: "Welcome Ananya! I have set up your 12-week vegetarian hypertrophy plan with plant protein isolate.",
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg_ar_02",
        userId: "user_purchased_02",
        senderId: "user_purchased_02",
        senderRole: "client",
        senderName: "Ananya Roy",
        text: "Hi Coach, can I replace almond milk with oat milk in my evening smoothie?",
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        read: false,
      },
    ],
  },
  user_purchased_04: {
    thread: {
      userId: "user_purchased_04",
      userName: "Pooja Mehta",
      userEmail: "pooja.mehta@gmail.com",
      userPhone: "+91 99304 22910",
      planGoal: "Weight Loss & Satiety",
      membershipCategory: "purchased",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      lastMessageText: "Checked your morning weigh-in: 64.7kg (down 800g)! Excellent PCOS management.",
      lastMessageAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      lastMessageSenderRole: "coach",
      unreadCountCoach: 0,
      unreadCountClient: 0,
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    messages: [
      {
        id: "msg_pm_01",
        userId: "user_purchased_04",
        senderId: "user_purchased_04",
        senderRole: "client",
        senderName: "Pooja Mehta",
        text: "Coach Naveen, I logged my morning weight: 64.7 kg! Down 800g in 6 days.",
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        read: true,
      },
      {
        id: "msg_pm_02",
        userId: "user_purchased_04",
        senderId: "coach_naveen",
        senderRole: "coach",
        senderName: "Coach Naveen",
        text: "Checked your morning weigh-in: 64.7kg (down 800g)! Excellent PCOS management. Keep your spearmint tea and seed cycling consistent.",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        read: true,
      },
    ],
  },
};

// Seed initial memory cache
function seedInitialChatData() {
  if (inMemoryThreads.size > 0) return;
  Object.values(INITIAL_DEMO_CHATS).forEach(({ thread, messages }) => {
    inMemoryThreads.set(thread.userId, { ...thread });
    inMemoryMessages.set(thread.userId, [...messages]);
  });
}

seedInitialChatData();

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

