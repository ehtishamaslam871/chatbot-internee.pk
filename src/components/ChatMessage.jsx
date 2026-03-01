"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FiUser, FiCopy, FiCheck, FiVolume2, FiMic } from "react-icons/fi";
import { useState } from "react";

const ChatMessage = memo(function ChatMessage({
  message,
  isStreaming = false,
  onSpeak,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 px-4 py-6 ${
        isUser ? "bg-transparent" : "bg-dark-800/30"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-primary-600"
            : "bg-gradient-to-br from-emerald-500 to-teal-600"
        }`}
      >
        {isUser ? (
          <FiUser size={16} className="text-white" />
        ) : (
          <span className="text-white text-sm font-bold">AI</span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-dark-200">
            {isUser ? "You" : "AI Assistant"}
          </span>
          {message.isVoiceMessage && (
            <FiMic size={12} className="text-primary-400" title="Voice message" />
          )}
          {message.createdAt && (
            <span className="text-xs text-dark-500">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div
          className={`prose prose-invert max-w-none text-dark-100 ${
            isStreaming ? "streaming-text" : ""
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code
                      className="bg-dark-700 text-primary-300 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <div className="relative group/code">
                      <pre className="bg-dark-900 border border-dark-700 rounded-lg p-4 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0 leading-7">{children}</p>;
                },
                ul({ children }) {
                  return (
                    <ul className="list-disc list-inside mb-2 space-y-1">
                      {children}
                    </ul>
                  );
                },
                ol({ children }) {
                  return (
                    <ol className="list-decimal list-inside mb-2 space-y-1">
                      {children}
                    </ol>
                  );
                },
                h1({ children }) {
                  return (
                    <h1 className="text-xl font-bold mb-2 mt-4">{children}</h1>
                  );
                },
                h2({ children }) {
                  return (
                    <h2 className="text-lg font-bold mb-2 mt-3">{children}</h2>
                  );
                },
                h3({ children }) {
                  return (
                    <h3 className="text-base font-bold mb-1 mt-2">
                      {children}
                    </h3>
                  );
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="border-l-4 border-primary-500 pl-4 my-2 text-dark-300 italic">
                      {children}
                    </blockquote>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {/* Streaming indicator */}
          {isStreaming && (
            <span className="inline-flex ml-1">
              <span className="w-2 h-2 bg-primary-400 rounded-full animate-typing mr-1" />
              <span
                className="w-2 h-2 bg-primary-400 rounded-full animate-typing mr-1"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 bg-primary-400 rounded-full animate-typing"
                style={{ animationDelay: "0.4s" }}
              />
            </span>
          )}
        </div>

        {/* Actions */}
        {!isStreaming && !isUser && message.content && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs text-dark-400 hover:text-white rounded hover:bg-dark-700 transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <FiCheck size={12} className="text-green-400" />
                  <span className="text-green-400">Copied</span>
                </>
              ) : (
                <>
                  <FiCopy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => onSpeak?.(message.content)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-dark-400 hover:text-white rounded hover:bg-dark-700 transition-colors"
              title="Read aloud"
            >
              <FiVolume2 size={12} />
              <span>Speak</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default ChatMessage;
