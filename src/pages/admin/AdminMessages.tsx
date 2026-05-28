import { FormEvent, useEffect, useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAdminMessages } from "@/hooks/useAdminMessages";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminMessages() {
  const { loading, error, usingDemoData, clientThreads, getThreadMessages, markThreadAsRead, sendReply } = useAdminMessages();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [composer, setComposer] = useState({ subject: "", body: "" });
  const [sendState, setSendState] = useState<{ error: string | null; success: string | null }>({
    error: null,
    success: null,
  });

  useEffect(() => {
    if (!selectedClientId && clientThreads[0]) {
      setSelectedClientId(clientThreads[0].clientId);
    }
  }, [clientThreads, selectedClientId]);

  const selectedThread = clientThreads.find((thread) => thread.clientId === selectedClientId) ?? clientThreads[0] ?? null;
  const threadMessages = useMemo(
    () => (selectedThread ? getThreadMessages(selectedThread.clientId) : []),
    [getThreadMessages, selectedThread]
  );

  useEffect(() => {
    if (selectedThread) {
      void markThreadAsRead(selectedThread.clientId);
    }
  }, [markThreadAsRead, selectedThread]);

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendState({ error: null, success: null });

    if (!selectedThread) {
      setSendState({ error: "Select a client thread first.", success: null });
      return;
    }

    if (!composer.subject.trim() || !composer.body.trim()) {
      setSendState({ error: "Subject and message body are required.", success: null });
      return;
    }

    const { error: replyError } = await sendReply(selectedThread.clientId, composer.subject.trim(), composer.body.trim());
    if (replyError) {
      setSendState({ error: replyError, success: null });
      return;
    }

    setComposer({ subject: "", body: "" });
    setSendState({
      error: null,
      success: usingDemoData ? "Reply added in demo mode." : "Reply sent successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Client Conversations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review inbound messages from clients and respond directly from the admin workspace.</p>
        </div>
        {usingDemoData && <Badge variant="secondary">Demo inbox mode</Badge>}
      </div>

      {error && <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">{error}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">Client Threads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <>
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
                <div className="h-20 animate-pulse rounded-xl bg-muted" />
              </>
            ) : clientThreads.length > 0 ? (
              clientThreads.map((thread) => (
                <button
                  key={thread.clientId}
                  type="button"
                  className={`w-full rounded-xl border border-border p-4 text-left transition-colors hover:bg-background/50 ${
                    selectedThread?.clientId === thread.clientId ? "bg-primary/5" : "bg-background/30"
                  }`}
                  onClick={() => setSelectedClientId(thread.clientId)}
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{thread.clientName}</div>
                      <div className="text-xs text-muted-foreground">{thread.clientEmail}</div>
                    </div>
                    {thread.unreadCount > 0 && <Badge variant="warning">{thread.unreadCount} new</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{thread.latestMessage.subject}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{formatDate(thread.latestMessage.created_at)}</div>
                </button>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Client messages will appear here once conversations start.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Conversation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedThread ? (
                threadMessages.map((message) => {
                  const outbound = message.sender_name === "AdPulse Team";
                  return (
                    <div
                      key={message.id}
                      className={`rounded-xl border p-4 ${
                        outbound ? "border-indigo-500/20 bg-indigo-500/5" : "border-border bg-background/30"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{outbound ? "AdPulse Team" : message.sender_name}</span>
                        <span>&bull;</span>
                        <span>{formatDate(message.created_at)}</span>
                      </div>
                      <div className="font-medium text-foreground">{message.subject}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.body}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Select a client thread to review the conversation.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-foreground">Reply to Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleReply}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input
                    value={composer.subject}
                    onChange={(event) => setComposer((current) => ({ ...current, subject: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <textarea
                    value={composer.body}
                    onChange={(event) => setComposer((current) => ({ ...current, body: event.target.value }))}
                    rows={5}
                    className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary"
                    placeholder="Send a project update, approval, or optimization note..."
                  />
                </div>
                {sendState.error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{sendState.error}</div>}
                {sendState.success && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                    {sendState.success}
                  </div>
                )}
                <Button variant="gradient" type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Reply
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
