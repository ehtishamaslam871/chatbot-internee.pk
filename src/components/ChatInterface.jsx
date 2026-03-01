"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import StreamingMessage from "./StreamingMessage";
import WelcomeScreen from "./WelcomeScreen";
import useVoice from "@/hooks/useVoice";
import useSocket from "@/hooks/useSocket";

export default function ChatInterface({
  conversationId,
  initialMessages = [],
  onConversationCreated,
  onMessageSent,
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Voice I/O hook
  const { isListening, startListening, stopListening, speak } = useVoice({
    onResult: (text) => {
      handleSendMessage(text, true);
    },
  });

  // WebSocket hook for real-time updates
  const { socket, isConnected } = useSocket({
    conversationId: currentConversationId,
    onNewMessage: (message) => {
      // Handle real-time messages from other sessions
      if (message.role === "assistant") {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (!exists) return [...prev, message];
          return prev;
        });
      }
    },
  });

  // Update messages when conversation changes
  useEffect(() => {
    setMessages(initialMessages);
    setCurrentConversationId(conversationId);
    setStreamingContent("");
    setIsLoading(false);
  }, [conversationId, initialMessages]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Send message handler with streaming and optimistic UI
  const handleSendMessage = useCallback(
    async (content, isVoice = false) => {
      if (!content.trim() || isLoading) return;

      // Optimistic UI: Add user message immediately
      const optimisticUserMessage = {
        _id: `temp-${Date.now()}`,
        role: "user",
        content: content.trim(),
        isVoiceMessage: isVoice,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticUserMessage]);
      setIsLoading(true);
      setStreamingContent("");

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            conversationId: currentConversationId,
            isVoice,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let newConversationId = currentConversationId;
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || ""; // Keep incomplete chunk in buffer

          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data: ")) continue;

            let data;
            try {
              data = JSON.parse(line.slice(6));
            } catch (e) {
              console.warn("SSE parse error:", e, line);
              continue;
            }

            switch (data.type) {
              case "meta":
                newConversationId = data.conversationId;
                if (!currentConversationId) {
                  setCurrentConversationId(newConversationId);
                  onConversationCreated?.(newConversationId);
                }
                break;

              case "chunk":
                fullResponse += data.content;
                setStreamingContent(fullResponse);
                break;

              case "done":
                // Replace streaming content with final message
                const assistantMessage = {
                  _id: data.assistantMessageId,
                  role: "assistant",
                  content: fullResponse,
                  createdAt: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
                setStreamingContent("");

                // Voice output for voice messages
                if (isVoice && fullResponse) {
                  speak(fullResponse);
                }

                // Emit via WebSocket for real-time sync
                if (socket && isConnected) {
                  socket.emit("message", {
                    conversationId: newConversationId,
                    message: assistantMessage,
                  });
                }

                onMessageSent?.();
                break;

              case "error":
                toast.error(data.content);
                break;
            }
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Send message error:", error);
          toast.error("Failed to send message. Please try again.");
          // Remove optimistic message on error
          setMessages((prev) =>
            prev.filter((m) => m._id !== optimisticUserMessage._id)
          );
        }
      } finally {
        setIsLoading(false);
        setStreamingContent("");
        abortControllerRef.current = null;
      }
    },
    [
      isLoading,
      currentConversationId,
      socket,
      isConnected,
      onConversationCreated,
      onMessageSent,
      speak,
    ]
  );

  // Text-to-speech handler
  const handleSpeak = useCallback(
    (text) => {
      speak(text);
    },
    [speak]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {messages.length === 0 && !isLoading ? (
          <WelcomeScreen onSendMessage={handleSendMessage} />
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((message) => (
              <div key={message._id} className="group">
                <ChatMessage
                  message={message}
                  onSpeak={handleSpeak}
                />
              </div>
            ))}

            {/* Streaming Response with Suspense */}
            {isLoading && (
              <Suspense fallback={<StreamingMessage content={null} />}>
                {streamingContent ? (
                  <div className="group">
                    <ChatMessage
                      message={{
                        _id: "streaming",
                        role: "assistant",
                        content: streamingContent,
                      }}
                      isStreaming={true}
                    />
                  </div>
                ) : (
                  <StreamingMessage content={null} />
                )}
              </Suspense>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        onVoiceInput={startListening}
        isListening={isListening}
        onStopListening={stopListening}
      />
    </div>
  );
}
