"use client";

import { motion } from "framer-motion";
import { FiMessageSquare, FiCode, FiBookOpen, FiZap } from "react-icons/fi";

const suggestions = [
  {
    icon: FiCode,
    title: "Write code",
    prompt: "Help me write a Python function to sort a list of objects by multiple keys",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: FiBookOpen,
    title: "Explain concept",
    prompt: "Explain how React Server Components work and their benefits",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FiZap,
    title: "Creative writing",
    prompt: "Write a short story about an AI that discovers music for the first time",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: FiMessageSquare,
    title: "General help",
    prompt: "What are the best practices for building scalable web applications?",
    color: "from-green-500 to-emerald-500",
  },
];

export default function WelcomeScreen({ onSendMessage }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30"
        >
          <FiMessageSquare className="text-white" size={36} />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-white mb-2"
        >
          Welcome to AI Chatbot
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-dark-300 mb-8 text-lg"
        >
          Powered by Google Gemini. Ask me anything!
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSendMessage(suggestion.prompt)}
              className="group text-left p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 transition-all"
            >
              <div
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${suggestion.color} flex items-center justify-center mb-2 group-hover:shadow-lg transition-shadow`}
              >
                <suggestion.icon size={16} className="text-white" />
              </div>
              <h3 className="text-sm font-medium text-white mb-1">
                {suggestion.title}
              </h3>
              <p className="text-xs text-dark-400 line-clamp-2">
                {suggestion.prompt}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
