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
import { adminFetch } from "@/lib/admin-api-client";

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
  if (!userId) {
    callback([]);
    return () => {};
  }

  // 1. If no messages exist in memory yet, initialize a polite introductory welcome
  const existingThread = inMemoryThreads.get(userId);
  const targetName = existingThread?.userName || "Athlete";
  const userCategory = existingThread?.membershipCategory || "free";

  if (!inMemoryMessages.has(userId)) {
    const greetingText =
      userCategory === "purchased" || userCategory === "membership"
        ? `Namaste ${targetName}! Coach Naveen here from BMYFIT. Your 8-week personalized plan and nutrition targets are ready. How is your energy and meal prep feeling today?`
        : `Namaste ${targetName}! Coach Naveen here from BMYFIT. I've reviewed your body metrics and clinical assessment. Let me know if you have any questions about your results!`;

    const greeting: ChatMessage = {
      id: `msg_welcome_${userId}`,
      userId,
      senderId: "coach_naveen",
      senderRole: "coach",
      senderName: "Coach Naveen",
      text: greetingText,
      createdAt: new Date().toISOString(),
      read: true,
    };
    inMemoryMessages.set(userId, [greeting]);

    if (!existingThread) {
      const initialThread: ChatThread = {
        userId,
        userName: targetName,
        userEmail: "",
        planGoal: "Fitness Transformation",
        membershipCategory: userCategory,
        lastMessageText: greeting.text,
        lastMessageAt: greeting.createdAt,
        lastMessageSenderRole: "coach",
        unreadCountCoach: 0,
        unreadCountClient: 0,
        updatedAt: greeting.createdAt,
      };
      inMemoryThreads.set(userId, initialThread);
    }
  }

  // Initial callback with in-memory data
  callback(inMemoryMessages.get(userId) || []);

  // 2. Background server fetch from API (handles server-side Firebase Admin authorization)
  void (async () => {
    try {
      // Try admin endpoint first
      let res = await adminFetch(`/api/admin/chats/${encodeURIComponent(userId)}/messages`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`/api/chats/${encodeURIComponent(userId)}/messages`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data.messages) && data.messages.length > 0) {
          inMemoryMessages.set(userId, data.messages);
          callback(data.messages);
        }
      }
    } catch (e) {
      console.warn("Background chat fetch notice:", e);
    }
  })();

  // 3. Listen to local event updates
  const handleLocalUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<{ userId: string }>;
    if (!customEvent.detail || customEvent.detail.userId === userId || customEvent.detail.userId === "all") {
      callback(inMemoryMessages.get(userId) || []);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener(CHAT_UPDATE_EVENT, handleLocalUpdate);
  }

  // 4. Listen to Firestore real-time collection: chats/{userId}/messages
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

          inMemoryMessages.set(userId, remoteMsgs);
          callback(remoteMsgs);
        }
      },
      (error) => {
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

  // 1. Update inMemory messages immediately for zero-lag UI response
  const existingMsgs = inMemoryMessages.get(userId) || [];
  inMemoryMessages.set(userId, [...existingMsgs, newMessage]);

  // 2. Update thread metadata
  const existingThread = inMemoryThreads.get(userId) || {
    userId,
    userName: senderRole === "client" ? senderName : "Client",
    userEmail: "",
    membershipCategory: "free",
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

  // 3. Persist to server via API endpoint (uses Firebase Admin SDK for 100% reliable write permissions)
  try {
    if (senderRole === "coach") {
      void adminFetch(`/api/admin/chats/${encodeURIComponent(userId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      }).catch((e) => console.warn("Admin chat API push notice:", e));
    } else {
      void fetch(`/api/chats/${encodeURIComponent(userId)}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      }).catch((e) => console.warn("Client chat API push notice:", e));
    }
  } catch (apiErr) {
    console.warn("Chat API dispatch notice:", apiErr);
  }

  // 4. Also attempt direct client Firestore write for instant real-time listener updates
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
        userEmail: updatedThread.userEmail || "",
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
    console.warn("Firestore direct chat write notice:", err);
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
  const getSortedThreads = () => {
    return Array.from(inMemoryThreads.values())
      .filter((t) => {
        // Exclude Coach Naveen from client thread list
        if (t.userEmail?.toLowerCase() === "bmyfitnesscoach@gmail.com") return false;
        if (t.userName?.toLowerCase() === "coach naveen") return false;
        // Exclude mock/test seed placeholders completely
        if (
          t.userId.startsWith("user_membership_") ||
          t.userId.startsWith("user_purchased_") ||
          t.userId.startsWith("user_purchase_") ||
          t.userId.startsWith("mock_") ||
          t.userId === "coach_naveen" ||
          !t.userName ||
          t.userName === "Client"
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
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
            // Skip dummy mock records completely
            if (
              docSnap.id.startsWith("user_membership_") ||
              docSnap.id.startsWith("user_purchased_") ||
              docSnap.id.startsWith("user_purchase_") ||
              docSnap.id.startsWith("mock_") ||
              docSnap.id === "coach_naveen" ||
              !data.userName ||
              data.userName === "Client"
            ) {
              return;
            }

            const existing = inMemoryThreads.get(docSnap.id);
            if (existing) {
              inMemoryThreads.set(docSnap.id, {
                ...existing,
                ...data,
                userId: docSnap.id,
                // Preserve genuine membership category
                membershipCategory: existing.membershipCategory || data.membershipCategory || "free",
              });
            } else if (data.userName && data.userName !== "Client") {
              inMemoryThreads.set(docSnap.id, {
                userId: docSnap.id,
                userName: data.userName,
                userEmail: data.userEmail || "",
                userPhone: data.userPhone,
                planGoal: data.planGoal || "Custom Fitness Plan",
                membershipCategory: data.membershipCategory || "free",
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
 * Synchronize registered users into chat threads so Coach can message all of them immediately
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
  let added = false;

  users.forEach((u) => {
    // Never include Coach Naveen as a client thread
    if (u.email?.toLowerCase() === "bmyfitnesscoach@gmail.com" || u.id === "coach_naveen" || u.name?.toLowerCase() === "coach naveen") {
      return;
    }

    const existing = inMemoryThreads.get(u.id);
    const category = u.membershipCategory || "free";

    if (!existing) {
      const newThread: ChatThread = {
        userId: u.id,
        userName: u.name,
        userEmail: u.email,
        userPhone: u.phone,
        avatarUrl: u.avatar,
        planGoal: u.goalDisplay || "Custom Fitness Plan",
        membershipCategory: category,
        lastMessageText: "Click here to message client directly.",
        lastMessageAt: new Date().toISOString(),
        lastMessageSenderRole: "coach",
        unreadCountCoach: 0,
        unreadCountClient: 0,
        updatedAt: new Date().toISOString(),
      };
      inMemoryThreads.set(u.id, newThread);
      added = true;
    } else {
      // Update details to ensure correct membership and name
      let modified = false;
      if (existing.userName !== u.name) {
        existing.userName = u.name;
        modified = true;
      }
      if (existing.membershipCategory !== category) {
        existing.membershipCategory = category;
        modified = true;
      }
      if (u.phone && existing.userPhone !== u.phone) {
        existing.userPhone = u.phone;
        modified = true;
      }
      if (u.goalDisplay && existing.planGoal !== u.goalDisplay) {
        existing.planGoal = u.goalDisplay;
        modified = true;
      }
      if (modified) {
        added = true;
      }
    }
  });

  if (added) {
    notifyChatUpdated("all");
  }
}
