"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSend, FiMic, FiMicOff, FiSquare } from "react-icons/fi";

export default function ChatInput({
  onSendMessage,
  isLoading,
  onVoiceInput,
  isListening,
  onStopListening,
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-dark-700/50 bg-dark-900/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 bg-dark-800 border border-dark-600 rounded-2xl focus-within:border-primary-500/50 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={isListening ? onStopListening : onVoiceInput}
              className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                isListening
                  ? "text-red-400 bg-red-500/10 animate-pulse-slow"
                  : "text-dark-400 hover:text-primary-400 hover:bg-dark-700"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
            </button>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening ? "Listening..." : "Type your message..."
              }
              rows={1}
              className="flex-1 bg-transparent text-white placeholder-dark-400 py-3 px-1 outline-none resize-none max-h-[200px] text-sm leading-6"
              disabled={isLoading}
            />

            {/* Send / Stop Button */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.button
                  key="stop"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  type="button"
                  className="flex-shrink-0 p-3 m-1 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  title="Stop generating"
                >
                  <FiSquare size={16} />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  type="submit"
                  disabled={!message.trim()}
                  className={`flex-shrink-0 p-3 m-1 rounded-xl transition-all ${
                    message.trim()
                      ? "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                      : "bg-dark-700 text-dark-500 cursor-not-allowed"
                  }`}
                  title="Send message"
                >
                  <FiSend size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Listening indicator */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full"
              >
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs text-red-300">Listening...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        <p className="text-center text-xs text-dark-500 mt-2">
          AI can make mistakes. Press Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
