"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";

/**
 * Custom hook for WebSocket real-time communication
 * Handles connection, room management, and real-time message sync
 */
export default function useSocket({ conversationId, onNewMessage } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    const socket = getSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      setIsConnected(true);
      // Join conversation room if we have one
      if (conversationId) {
        socket.emit("join-conversation", conversationId);
        currentRoomRef.current = conversationId;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleNewMessage = (data) => {
      onNewMessage?.(data.message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("new-message", handleNewMessage);

    // If already connected, join room immediately
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("new-message", handleNewMessage);

      // Leave current room
      if (currentRoomRef.current) {
        socket.emit("leave-conversation", currentRoomRef.current);
        currentRoomRef.current = null;
      }
    };
  }, [conversationId, onNewMessage]);

  // Switch rooms when conversation changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    // Leave old room
    if (currentRoomRef.current && currentRoomRef.current !== conversationId) {
      socket.emit("leave-conversation", currentRoomRef.current);
    }

    // Join new room
    if (conversationId) {
      socket.emit("join-conversation", conversationId);
      currentRoomRef.current = conversationId;
    }
  }, [conversationId]);

  // Send a message via WebSocket
  const sendMessage = useCallback((data) => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("message", data);
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping) => {
      const socket = socketRef.current;
      if (socket?.connected && conversationId) {
        socket.emit("typing", { conversationId, isTyping });
      }
    },
    [conversationId]
  );

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    sendTyping,
  };
}
