import { useEffect, useRef, useState } from "react";

import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssistantMessages, useClearAssistantMessages, useSendAssistantMessage } from "@/hooks/use-assistant";
import { useSetSetting } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Check, Copy, MessageSquareText, Paperclip, PenTool, RefreshCw, Send, Trash2, User, X } from "lucide-react";
import { DEFAULT_GEMINI_MODEL, geminiModelOptions, isGeminiModelId, type GeminiModelId } from "@shared/ai-models";

interface AssistantViewProps {
  isGuestMode?: boolean;
}

export function AssistantView({ isGuestMode = false }: AssistantViewProps) {
  const { user } = useAuth();
  const { data: messages = [] } = useAssistantMessages(50, { enabled: !isGuestMode });
  const sendMessage = useSendAssistantMessage();
  const clearMessages = useClearAssistantMessages();
  const setSetting = useSetSetting();
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(DEFAULT_GEMINI_MODEL);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const storedModel = typeof window !== "undefined" ? window.localStorage.getItem("assistant:model") : null;
    if (isGeminiModelId(storedModel)) {
      setSelectedModel(storedModel);
    }
  }, []);

  const handleModelChange = (model: GeminiModelId) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("assistant:model", model);
    }
    if (user?.id) {
      setSetting.mutate({ key: "geminiModel", value: model, userId: user.id });
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMessage.isPending) return;
    sendMessage.mutate({ content: trimmed, model: selectedModel }, {
      onSuccess: () => {
        setInput("");
        setEditingMessageId(null);
      },
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

  const handleEditMessage = (id: number, content: string) => {
    setInput(content);
    setEditingMessageId(id);
    composerRef.current?.focus();
  };

  const getPromptForAssistantMessage = (messageIndex: number) => {
    for (let i = messageIndex - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "user") {
        return messages[i].content;
      }
    }
    return "";
  };

  const handleRegenerate = (messageIndex: number) => {
    if (sendMessage.isPending) return;
    const prompt = getPromptForAssistantMessage(messageIndex).trim();
    if (!prompt) return;
    sendMessage.mutate({ content: prompt, model: selectedModel });
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
              <CardTitle className="text-lg font-semibold">Assistant Chat</CardTitle>
              <p className="text-xs text-muted-foreground">
                Ask about habits, tags, goals, and recent notes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedModel} onValueChange={(value) => handleModelChange(value as GeminiModelId)}>
                <SelectTrigger className="h-9 w-[220px]" data-testid="select-assistant-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {geminiModelOptions.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {messages.map((message, messageIndex) => {
                  const regeneratePrompt = message.role === "assistant"
                    ? getPromptForAssistantMessage(messageIndex).trim()
                    : "";

                  return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role !== "user" && (
                      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-md px-4 py-3 text-sm leading-relaxed ${
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
                      <div className={`mt-2 flex items-center gap-1 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => copyToClipboard(message.content, message.id)}
                          title="Copy message"
                          data-testid={`button-copy-message-${message.id}`}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        {message.role === "user" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleEditMessage(message.id, message.content)}
                            title="Edit and resend"
                            data-testid={`button-edit-message-${message.id}`}
                          >
                            <PenTool className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleRegenerate(messageIndex)}
                            disabled={!regeneratePrompt || sendMessage.isPending}
                            title="Regenerate reply"
                            data-testid={`button-regenerate-message-${message.id}`}
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${sendMessage.isPending ? "animate-spin" : ""}`} />
                          </Button>
                        )}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  );
                })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="space-y-2">
            {editingMessageId && (
              <div className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                <span>Editing previous message before resend</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setEditingMessageId(null);
                    setInput("");
                  }}
                  title="Cancel editing"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
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
                ref={composerRef}
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
