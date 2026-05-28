import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Message, Profile } from "@/lib/database.types";
import { getLocalDemoMessages, getLocalDemoProfiles } from "@/lib/demoData";

export interface AdminMessage extends Message {
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

export function useAdminMessages() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  const refreshMessages = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchPromise = Promise.all([
        supabase.from("messages").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Admin messages query timed out after 5 seconds.")), 5000);
      });

      const [messagesRes, profilesRes] = await Promise.race([fetchPromise, timeoutPromise]);

      if (messagesRes.error) throw messagesRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const nextProfiles = (profilesRes.data ?? []) as Profile[];
      const namesById = new Map(
        nextProfiles.map((profile) => [profile.id, profile.role === "admin" ? "AdPulse Team" : profile.full_name])
      );
      const nextAdminId = nextProfiles.find((profile) => profile.role === "admin")?.id ?? null;

      setAdminId(nextAdminId);
      setProfiles(nextProfiles);
      setMessages(
        ((messagesRes.data ?? []) as Message[]).map((message) => ({
          ...message,
          sender_name: namesById.get(message.sender_id) ?? "Unknown sender",
          receiver_name: namesById.get(message.receiver_id) ?? "Unknown receiver",
        }))
      );
      setUsingDemoData(false);
    } catch (err) {
      const message = getReadableErrorMessage(err);
      console.error("Failed to load admin messages:", err);
      const demoProfiles = getLocalDemoProfiles();
      const demoAdminId = demoProfiles.find((profile) => profile.role === "admin")?.id ?? "demo-admin";
      const demoClients = demoProfiles.filter((profile) => profile.role === "client");

      setProfiles(demoProfiles);
      setAdminId(demoAdminId);
      setMessages(
        demoClients.flatMap((client, index) =>
          getLocalDemoMessages(client.id, client.full_name).map((threadMessage, messageIndex) => ({
            ...threadMessage,
            id: `${threadMessage.id}-${client.id}`,
            created_at: new Date(Date.now() - (index * 3 + messageIndex) * 86400000).toISOString(),
          }))
        )
      );
      setUsingDemoData(true);
      setError(`Live message data was unavailable, so demo inbox data is being shown. ${message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMessages();
  }, []);

  const clientThreads = useMemo(() => {
    const grouped = new Map<
      string,
      {
        clientId: string;
        clientName: string;
        clientEmail: string;
        latestMessage: AdminMessage;
        unreadCount: number;
      }
    >();

    for (const message of messages) {
      const clientId = message.sender_id === adminId ? message.receiver_id : message.sender_id;
      const client = profiles.find((profile) => profile.id === clientId);
      if (!client) continue;

      const current = grouped.get(clientId);
      const unreadContribution = message.receiver_id === adminId && !message.is_read ? 1 : 0;

      if (!current) {
        grouped.set(clientId, {
          clientId,
          clientName: client.full_name,
          clientEmail: client.email,
          latestMessage: message,
          unreadCount: unreadContribution,
        });
        continue;
      }

      current.unreadCount += unreadContribution;
      if (new Date(message.created_at).getTime() > new Date(current.latestMessage.created_at).getTime()) {
        current.latestMessage = message;
      }
    }

    return [...grouped.values()].sort(
      (a, b) => new Date(b.latestMessage.created_at).getTime() - new Date(a.latestMessage.created_at).getTime()
    );
  }, [messages, profiles, adminId]);

  const getThreadMessages = useCallback(
    (clientId: string) =>
      messages
        .filter((message) => message.sender_id === clientId || message.receiver_id === clientId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [messages]
  );

  const markThreadAsRead = useCallback(async (clientId: string) => {
    const unreadIds = messages
      .filter((message) => message.sender_id === clientId && message.receiver_id === adminId && !message.is_read)
      .map((message) => message.id);

    if (!unreadIds.length) return;

    setMessages((current) =>
      current.map((message) => (unreadIds.includes(message.id) ? { ...message, is_read: true } : message))
    );

    if (usingDemoData) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from("messages") as any).update({ is_read: true }).in("id", unreadIds);
    if (updateError) {
      console.error("Failed to mark thread as read:", updateError);
    }
  }, [adminId, messages, usingDemoData]);

  const sendReply = useCallback(async (clientId: string, subject: string, body: string) => {
    if (!adminId) return { error: "Admin account was not resolved." };

    const client = profiles.find((profile) => profile.id === clientId);
    const timestamp = new Date().toISOString();

    if (usingDemoData) {
      setMessages((current) => [
        ...current,
        {
          id: `admin-reply-${Date.now()}`,
          sender_id: adminId,
          receiver_id: clientId,
          subject,
          body,
          is_read: false,
          created_at: timestamp,
          sender_name: "AdPulse Team",
          receiver_name: client?.full_name ?? "Client",
        },
      ]);
      return { error: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error: insertError } = await (supabase.from("messages") as any)
      .insert({
        sender_id: adminId,
        receiver_id: clientId,
        subject,
        body,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message };
    }

    const insertedMessage = data as Message;
    setMessages((current) => [
      ...current,
      {
        ...insertedMessage,
        sender_name: "AdPulse Team",
        receiver_name: client?.full_name ?? "Client",
      },
    ]);
    return { error: null };
  }, [adminId, profiles, usingDemoData]);

  return {
    messages,
    profiles,
    loading,
    error,
    usingDemoData,
    clientThreads,
    getThreadMessages,
    markThreadAsRead,
    sendReply,
  };
}
