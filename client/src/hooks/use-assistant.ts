import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

const messagesKeyPrefix = "/api/assistant/messages";
const messagesQueryKey = "assistant-messages";

type AssistantResponse = {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
};

export function useAssistantMessages(limit = 50, options?: { enabled?: boolean }) {
  const url = `${messagesKeyPrefix}?limit=${limit}`;
  return useQuery<ChatMessage[]>({
    queryKey: [messagesQueryKey, limit],
    queryFn: async () => {
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch assistant messages");
      }
      return response.json();
    },
    enabled: options?.enabled ?? true,
  });
}

export function useSendAssistantMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest(messagesKeyPrefix, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return response.json() as Promise<AssistantResponse>;
    },
    onSuccess: (data) => {
      const queries = queryClient.getQueriesData<ChatMessage[]>({
        queryKey: [messagesQueryKey],
      });
      queries.forEach(([key, messages]) => {
        const limit = typeof key[1] === "number" ? key[1] : 50;
        const nextMessages = [...(messages || []), data.userMessage, data.assistantMessage].slice(-limit);
        queryClient.setQueryData(key, nextMessages);
      });
    },
  });
}

export function useClearAssistantMessages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest(messagesKeyPrefix, { method: "DELETE" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueriesData({ queryKey: [messagesQueryKey] }, []);
    },
  });
}
