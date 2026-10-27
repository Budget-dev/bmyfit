export type ChatSenderRole = "client" | "coach";

export interface ChatMessage {
  id: string;
  userId: string; // ID of the client thread owner
  senderId: string;
  senderRole: ChatSenderRole;
  senderName: string;
  text: string;
  createdAt: string; // ISO timestamp
  read: boolean;
}

export interface ChatThread {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  planGoal?: string;
  membershipCategory?: "purchased" | "membership" | "free";
  avatarUrl?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  lastMessageSenderRole?: ChatSenderRole;
  unreadCountCoach: number; // Messages sent by client that Coach has not read yet
  unreadCountClient: number; // Messages sent by Coach that Client has not read yet
  updatedAt: string;
}
