import { adminDb, hasAdminCredentials } from "@/lib/firebase/admin";
import { toErrorResponse } from "@/lib/errors";
import type { ChatMessage } from "@/types/chat";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

// Server memory store fallback when service account private key is not configured locally
declare global {
  var __bmyfit_server_chats__: Map<string, ChatMessage[]> | undefined;
  var __bmyfit_server_threads__: Map<string, Record<string, unknown>> | undefined;
}

if (!globalThis.__bmyfit_server_chats__) {
  globalThis.__bmyfit_server_chats__ = new Map<string, ChatMessage[]>();
}
if (!globalThis.__bmyfit_server_threads__) {
  globalThis.__bmyfit_server_threads__ = new Map<string, Record<string, unknown>>();
}

// GET /api/chats/[userId]/messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return Response.json({ messages: [] });
    }

    const messages: ChatMessage[] = [];

    // 1. Try Firebase Admin Firestore if credentials exist
    if (hasAdminCredentials) {
      try {
        const messagesSnap = await adminDb
          .collection("chats")
          .doc(userId)
          .collection("messages")
          .orderBy("createdAt", "asc")
          .get();

        messagesSnap.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: doc.id,
            userId: data.userId || userId,
            senderId: data.senderId || "unknown",
            senderRole: data.senderRole || "client",
            senderName: data.senderName || "User",
            text: data.text || "",
            createdAt: data.createdAt?.toDate
              ? data.createdAt.toDate().toISOString()
              : data.createdAt || new Date().toISOString(),
            read: Boolean(data.read),
          });
        });
      } catch (adminErr) {
        console.warn("adminDb messages fetch notice:", adminErr);
      }
    }

    // 2. Merge with server in-memory store
    const inMem = globalThis.__bmyfit_server_chats__?.get(userId) || [];
    const existingIds = new Set(messages.map((m) => m.id));
    for (const msg of inMem) {
      if (!existingIds.has(msg.id)) {
        messages.push(msg);
        existingIds.add(msg.id);
      }
    }

    // Sort by createdAt asc
    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return Response.json({ messages });
  } catch (error) {
    return toErrorResponse(error);
  }
}

// POST /api/chats/[userId]/messages
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = (await request.json()) as Partial<ChatMessage>;

    if (!userId || !body.text?.trim()) {
      return Response.json({ error: "Missing required message parameters" }, { status: 400 });
    }

    const msgId = body.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newMessage: ChatMessage = {
      id: msgId,
      userId,
      senderId: body.senderId || userId,
      senderRole: body.senderRole || "client",
      senderName: body.senderName || "Athlete",
      text: body.text.trim(),
      createdAt: now,
      read: false,
    };

    // 1. Update server in-memory store
    const currentMsgs = globalThis.__bmyfit_server_chats__?.get(userId) || [];
    currentMsgs.push(newMessage);
    globalThis.__bmyfit_server_chats__?.set(userId, currentMsgs);

    const threadMeta = {
      userId,
      lastMessageText: newMessage.text,
      lastMessageAt: now,
      lastMessageSenderRole: newMessage.senderRole,
      unreadCountCoach: 1,
      updatedAt: now,
    };
    globalThis.__bmyfit_server_threads__?.set(userId, threadMeta);

    // 2. Persist to Firestore via Admin SDK if credentials exist
    if (hasAdminCredentials) {
      try {
        await adminDb
          .collection("chats")
          .doc(userId)
          .collection("messages")
          .doc(msgId)
          .set(
            {
              ...newMessage,
              timestamp: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

        await adminDb
          .collection("chats")
          .doc(userId)
          .set(
            {
              ...threadMeta,
              timestamp: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      } catch (dbErr) {
        console.warn("adminDb write notice:", dbErr);
      }
    }

    return Response.json({ success: true, message: newMessage });
  } catch (error) {
    return toErrorResponse(error);
  }
}
