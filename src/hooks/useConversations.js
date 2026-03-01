"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for managing conversations
 * Handles CRUD operations with optimistic UI updates
 */
export default function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Create new conversation (optimistic)
  const createConversation = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", { method: "POST" });
      if (!response.ok) throw new Error("Failed to create conversation");
      const data = await response.json();
      setConversations((prev) => [data.conversation, ...prev]);
      return data.conversation;
    } catch (error) {
      console.error("Create conversation error:", error);
      return null;
    }
  }, []);

  // Delete conversation (optimistic)
  const deleteConversation = useCallback(async (id) => {
    // Optimistic removal
    setConversations((prev) => prev.filter((c) => c._id !== id));

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        // Revert on failure
        fetchConversations();
        throw new Error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Delete conversation error:", error);
    }
  }, [fetchConversations]);

  // Rename conversation (optimistic)
  const renameConversation = useCallback(async (id, title) => {
    // Optimistic update
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, title } : c))
    );

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to rename conversation");
    } catch (error) {
      console.error("Rename conversation error:", error);
      fetchConversations(); // Revert
    }
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
  };
}
