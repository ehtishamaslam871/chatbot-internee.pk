"use client";

import { motion } from "framer-motion";

/**
 * Streaming message component with typing animation
 * Uses React Suspense patterns for smooth loading
 */
export default function StreamingMessage({ content }) {
  if (!content) {
    return (
      <div className="flex gap-3 px-4 py-6 bg-dark-800/30">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <span className="text-white text-sm font-bold">AI</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-dark-200">
              AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-primary-400 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-primary-400 rounded-full"
            />
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-primary-400 rounded-full"
            />
            <span className="text-sm text-dark-400 ml-2">Thinking...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
