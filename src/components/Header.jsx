"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { FiMenu, FiPlus, FiMessageSquare } from "react-icons/fi";
import { motion } from "framer-motion";

export default function Header({ onToggleSidebar, onNewChat }) {
  const { user } = useUser();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-dark-900/80 backdrop-blur-xl border-b border-dark-700/50"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-dark-700/50 text-dark-300 hover:text-white transition-colors lg:hidden"
          aria-label="Toggle sidebar"
        >
          <FiMenu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <FiMessageSquare className="text-white" size={16} />
          </div>
          <h1 className="text-lg font-semibold text-white hidden sm:block">
            AI Chatbot
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
        >
          <FiPlus size={16} />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <div className="flex items-center gap-2">
          {user && (
            <span className="text-sm text-dark-300 hidden md:block">
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </span>
          )}
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
