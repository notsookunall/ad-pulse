import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { useClientMessages } from "@/hooks/useClientMessages";
import { Mail, MessageSquarePlus, Send } from "lucide-react";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Messages() {
  const { user, profile } = useAuth();
  const { messages, loading, error, usingDemoData, markAsRead, sendMessage } = useClientMessages(
    user?.id,
    profile?.full_name
  );
  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState({ subject: "", body: "" });
  const [sendState, setSendState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });

  const filteredMessages = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return messages;

    return messages.filter((message) =>
      [message.subject, message.body, message.sender_name, message.receiver_name]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [messages, query]);

  const selectedMessage = filteredMessages[0] ?? null;

  useEffect(() => {
    if (selectedMessage && !selectedMessage.is_read && selectedMessage.receiver_id === user?.id) {
      void markAsRead(selectedMessage.id);
    }
  }, [selectedMessage?.id, selectedMessage?.is_read, selectedMessage?.receiver_id, user?.id]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendState({ error: null, success: null });

    if (!composer.subject.trim() || !composer.body.trim()) {
      setSendState({ error: "Subject and message body are required.", success: null });
      return;
    }

    const { error: sendError } = await sendMessage(composer.subject.trim(), composer.body.trim());
    if (sendError) {
      setSendState({ error: sendError, success: null });
      return;
    }

    setComposer({ subject: "", body: "" });
    setSendState({ error: null, success: "Message sent successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Messages</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep campaign communication in one place with notes, approvals, and follow-up requests.
          </p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo inbox mode</Badge>}
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-medium text-foreground">Inbox</CardTitle>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search messages..."
              className="sm:max-w-[240px]"
            />
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <div className="animate-pulse rounded-xl bg-muted h-20" />
                <div className="animate-pulse rounded-xl bg-muted h-20" />
                <div className="animate-pulse rounded-xl bg-muted h-20" />
              </>
            ) : filteredMessages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                No messages matched your search.
              </div>
            ) : (
              filteredMessages.map((message) => {
                const inbound = message.receiver_id === user?.id;
                return (
                  <button
                    key={message.id}
                    type="button"
                    className="w-full rounded-xl border border-border bg-background/30 p-4 text-left transition-colors hover:bg-background/50"
                    onClick={() => void markAsRead(message.id)}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-foreground">{message.subject}</div>
                        <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {inbound ? `From ${message.sender_name}` : `To ${message.receiver_name}`}
                        </div>
                      </div>
                      {!message.is_read && <Badge variant="warning">New</Badge>}
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{message.body}</p>
                    <div className="mt-3 text-xs text-muted-foreground">{formatDate(message.created_at)}</div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Selected Message</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedMessage ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{selectedMessage.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedMessage.receiver_id === user?.id
                          ? `From ${selectedMessage.sender_name}`
                          : `To ${selectedMessage.receiver_name}`}{" "}
                        • {formatDate(selectedMessage.created_at)}
                      </p>
                    </div>
                    <Badge variant={selectedMessage.is_read ? "secondary" : "warning"}>
                      {selectedMessage.is_read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-border bg-background/30 p-4 text-sm leading-7 text-muted-foreground">
                    {selectedMessage.body}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  Select a message to preview it here.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
                <MessageSquarePlus className="h-5 w-5" /> Compose Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSend}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input
                    value={composer.subject}
                    onChange={(event) => setComposer((current) => ({ ...current, subject: event.target.value }))}
                    placeholder="Campaign feedback or question"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <textarea
                    value={composer.body}
                    onChange={(event) => setComposer((current) => ({ ...current, body: event.target.value }))}
                    rows={5}
                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Write your note to the AdPulse team..."
                  />
                </div>
                {sendState.error && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {sendState.error}
                  </div>
                )}
                {sendState.success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    {sendState.success}
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background/30 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Messages stay attached to your client workspace for easy review during meetings.
                  </div>
                  <Button variant="gradient" type="submit">
                    <Send className="mr-2 h-4 w-4" /> Send
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
