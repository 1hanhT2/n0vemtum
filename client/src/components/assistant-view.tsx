import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAssistantMessages, useClearAssistantMessages, useSendAssistantMessage } from "@/hooks/use-assistant";
import { Bot, Check, Copy, MessageSquareText, Paperclip, Send, Trash2, User } from "lucide-react";

interface AssistantViewProps {
  isGuestMode?: boolean;
}

export function AssistantView({ isGuestMode = false }: AssistantViewProps) {
  const { data: messages = [] } = useAssistantMessages(50, { enabled: !isGuestMode });
  const sendMessage = useSendAssistantMessage();
  const clearMessages = useClearAssistantMessages();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const modelLabel = "Gemini 3 Flash";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate(trimmed, {
      onSuccess: () => setInput(""),
    });
  };

  const handleComposerKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, id: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {
      // ignore
    }
  };

  if (isGuestMode) {
    return (
      <Card className="border border-border rounded-md bg-card text-card-foreground">
        <CardContent className="p-8 text-center text-muted-foreground">
          Sign in to use the AI assistant and save your conversations.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquareText className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Assistant</h2>
      </div>

      <Card className="border border-border rounded-md bg-card text-card-foreground">
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">AI Coach Chat</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ask about habits, tags, goals, and recent notes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                Model: {modelLabel}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearMessages.mutate()}
                disabled={clearMessages.isPending}
                className="text-muted-foreground hover:text-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <ScrollArea className="h-[55vh] pr-4 settings-scroll">
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center text-center text-sm text-muted-foreground py-10">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="font-medium text-foreground">Start a conversation</div>
                  <div className="max-w-xs text-xs text-muted-foreground">
                    Try “Summarize my last week” or “Where am I strongest right now?”
                  </div>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role !== "user" && (
                      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`relative max-w-[85%] rounded-md px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-primary/10 text-foreground"
                          : "bg-muted text-foreground border border-border"
                      }`}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        {message.role === "user" ? "You" : "Assistant"}
                      </div>
                      <div className="prose prose-sm max-w-none text-foreground prose-p:my-2 prose-li:my-1 prose-strong:text-foreground">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                      {message.role !== "user" && message.content && (
                        <button
                          type="button"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="absolute -right-2 -top-2 rounded-md border border-border bg-card/90 p-2 text-muted-foreground shadow-sm hover:text-foreground"
                          title="Copy"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 p-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground hover:text-foreground"
                title="Attach (coming soon)"
                disabled
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about progress, goals, or how to improve..."
                className="min-h-0 h-11 resize-none border-0 bg-transparent px-2 py-3 text-sm leading-5 shadow-none focus-visible:ring-0"
                onKeyDown={handleComposerKeyDown}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || sendMessage.isPending}
                className="h-10"
              >
                <Send className="mr-2 h-4 w-4" />
                {sendMessage.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Enter to send • Shift+Enter for new line</span>
              <span className="hidden sm:inline">Markdown supported</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
