import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getLocalDemoMessages } from "@/lib/demoData";
import type { Message, Profile } from "@/lib/database.types";

const LIVE_QUERY_TIMEOUT_MS = 15000;

export interface ClientMessage extends Message {
  sender_name: string;
  receiver_name: string;
}

function getReadableErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

export function useClientMessages(userId?: string, profileName?: string) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [adminRecipientId, setAdminRecipientId] = useState<string | null>(null);

  const refreshMessages = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const messagesPromise = supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Messages query timed out after 15 seconds.")), LIVE_QUERY_TIMEOUT_MS);
      });

      const { data, error: messagesError } = await Promise.race([messagesPromise, timeoutPromise]);

      if (messagesError) {
        throw messagesError;
      }

      const rawMessages = (data ?? []) as Message[];
      const profileIds = [...new Set(rawMessages.flatMap((message) => [message.sender_id, message.receiver_id]))];

      let namesById = new Map<string, string>();

      if (profileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .in("id", profileIds);

        namesById = new Map(
          ((profilesData ?? []) as Array<Pick<Profile, "id" | "full_name" | "role">>).map((profile) => [
            profile.id,
            profile.role === "admin" ? "AdPulse Team" : profile.full_name,
          ])
        );

        const adminProfile = ((profilesData ?? []) as Array<Pick<Profile, "id" | "role">>).find((profile) => profile.role === "admin");
        setAdminRecipientId(adminProfile?.id ?? userId);
      } else {
        setAdminRecipientId(userId);
      }

      setMessages(
        rawMessages.map((message) => ({
          ...message,
          sender_name: namesById.get(message.sender_id) ?? (message.sender_id === userId ? profileName ?? "You" : "AdPulse Team"),
          receiver_name: namesById.get(message.receiver_id) ?? (message.receiver_id === userId ? profileName ?? "You" : "AdPulse Team"),
        }))
      );
      setUsingDemoData(false);
    } catch (err) {
      const message = getReadableErrorMessage(err);
      console.error("Failed to load messages:", err);
      setMessages(getLocalDemoMessages(userId, profileName ?? "Client User"));
      setUsingDemoData(true);
      setAdminRecipientId(userId);
      setError(`Live messages were unavailable, so demo inbox data is being shown. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    setMessages((current) =>
      current.map((message) => (message.id === messageId ? { ...message, is_read: true } : message))
    );

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("messages") as any).update({ is_read: true }).eq("id", messageId);
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const sendMessage = async (subject: string, body: string) => {
    if (!userId) {
      return { error: "No active user session." };
    }

    const receiverId = adminRecipientId ?? userId;

    if (usingDemoData) {
      setMessages((current) => [
        {
          id: `local-message-${Date.now()}`,
          sender_id: userId,
          receiver_id: receiverId,
          subject,
          body,
          is_read: false,
          created_at: new Date().toISOString(),
          sender_name: profileName ?? "You",
          receiver_name: "AdPulse Team",
        },
        ...current,
      ]);
      return { error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: sendError } = await (supabase.from("messages") as any).insert({
      sender_id: userId,
      receiver_id: receiverId,
      subject,
      body,
      is_read: false,
    });

    if (sendError) {
      return { error: sendError.message };
    }

    await refreshMessages();
    return { error: null };
  };

  useEffect(() => {
    void refreshMessages();
  }, [userId]);

  return {
    messages,
    loading,
    error,
    usingDemoData,
    refreshMessages,
    markAsRead,
    sendMessage,
  };
}
