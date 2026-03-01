"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ChatSidebar from "@/components/ChatSidebar";
import ChatInterface from "@/components/ChatInterface";
import useConversations from "@/hooks/useConversations";

/**
 * Main Chat Page
 * Handles conversation management, routing, and layout
 */
export default function ChatPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMessages, setActiveMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const {
    conversations,
    isLoading: isLoadingConversations,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  } = useConversations();

  // Load messages for a conversation
  const loadConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setActiveMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error("Failed to load conversation");
      const data = await response.json();
      setActiveMessages(data.messages);
    } catch (error) {
      console.error("Load conversation error:", error);
      setActiveMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = useCallback(
    (id) => {
      setActiveConversationId(id);
      loadConversation(id);
    },
    [loadConversation]
  );

  // Handle new chat
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setActiveMessages([]);
  }, []);

  // Handle conversation created (from first message)
  const handleConversationCreated = useCallback(
    (newId) => {
      setActiveConversationId(newId);
      // Refresh conversation list
      fetchConversations();
    },
    [fetchConversations]
  );

  // Handle when a message is sent (refresh conversations to update titles/dates)
  const handleMessageSent = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle delete conversation
  const handleDeleteConversation = useCallback(
    async (id) => {
      await deleteConversation(id);
      if (id === activeConversationId) {
        setActiveConversationId(null);
        setActiveMessages([]);
      }
    },
    [deleteConversation, activeConversationId]
  );

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={renameConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {isLoadingMessages ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-dark-400">
                  Loading conversation...
                </p>
              </div>
            </div>
          ) : (
            <ChatInterface
              key={activeConversationId || "new"}
              conversationId={activeConversationId}
              initialMessages={activeMessages}
              onConversationCreated={handleConversationCreated}
              onMessageSent={handleMessageSent}
            />
          )}
        </main>
      </div>
    </div>
  );
}
