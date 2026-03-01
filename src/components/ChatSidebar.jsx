"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlus,
  FiMessageSquare,
  FiTrash2,
  FiEdit2,
  FiCheck,
  FiX,
  FiClock,
} from "react-icons/fi";

export default function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onClose,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (conv) => {
    setEditingId(conv._id);
    setEditTitle(conv.title);
  };

  const handleSaveEdit = (id) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const groupConversations = () => {
    const groups = { today: [], yesterday: [], week: [], older: [] };
    const now = new Date();

    conversations.forEach((conv) => {
      const date = new Date(conv.lastMessageAt || conv.createdAt);
      const diffDays = Math.floor((now - date) / 86400000);

      if (diffDays === 0) groups.today.push(conv);
      else if (diffDays === 1) groups.yesterday.push(conv);
      else if (diffDays < 7) groups.week.push(conv);
      else groups.older.push(conv);
    });

    return groups;
  };

  const groups = groupConversations();

  const renderGroup = (title, convs) => {
    if (convs.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="px-3 mb-1 text-xs font-semibold text-dark-400 uppercase tracking-wider">
          {title}
        </h3>
        {convs.map((conv) => (
          <motion.div
            key={conv._id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all ${
              activeConversationId === conv._id
                ? "bg-primary-600/20 text-white border border-primary-500/30"
                : "hover:bg-dark-700/50 text-dark-300 hover:text-white"
            }`}
            onClick={() => {
              onSelectConversation(conv._id);
              onClose?.();
            }}
          >
            <FiMessageSquare
              size={14}
              className="flex-shrink-0 text-dark-400"
            />

            {editingId === conv._id ? (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(conv._id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 bg-dark-700 text-white text-sm px-2 py-1 rounded outline-none border border-dark-600 focus:border-primary-500"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit(conv._id);
                  }}
                  className="p-1 text-green-400 hover:text-green-300"
                >
                  <FiCheck size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(null);
                  }}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <FiX size={12} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{conv.title}</p>
                  <p className="text-xs text-dark-500 flex items-center gap-1">
                    <FiClock size={10} />
                    {formatDate(conv.lastMessageAt || conv.createdAt)}
                  </p>
                </div>

                <div className="hidden group-hover:flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(conv);
                    }}
                    className="p-1 text-dark-400 hover:text-white rounded"
                    title="Rename"
                  >
                    <FiEdit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv._id);
                    }}
                    className="p-1 text-dark-400 hover:text-red-400 rounded"
                    title="Delete"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-dark-900 border-r border-dark-700/50 flex flex-col lg:translate-x-0`}
      >
        {/* New Chat Button */}
        <div className="p-3 border-b border-dark-700/50">
          <button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dark-600 hover:border-dark-500 text-dark-200 hover:text-white transition-all hover:bg-dark-800"
          >
            <FiPlus size={16} />
            <span className="text-sm font-medium">New Conversation</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <FiMessageSquare className="mx-auto mb-3 text-dark-500" size={32} />
              <p className="text-sm text-dark-400">No conversations yet</p>
              <p className="text-xs text-dark-500 mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            <>
              {renderGroup("Today", groups.today)}
              {renderGroup("Yesterday", groups.yesterday)}
              {renderGroup("This Week", groups.week)}
              {renderGroup("Older", groups.older)}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-dark-700/50">
          <p className="text-xs text-dark-500 text-center">
            Powered by Gemini AI
          </p>
        </div>
      </motion.aside>
    </>
  );
}
