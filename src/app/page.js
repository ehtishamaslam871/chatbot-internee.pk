"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FiMessageSquare, FiShield, FiZap, FiMic, FiArrowRight } from "react-icons/fi";
import Link from "next/link";

/**
 * Landing Page
 * Redirects authenticated users to /chat
 */
export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/chat");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const features = [
    {
      icon: FiZap,
      title: "Streaming AI Responses",
      description: "Real-time streaming with React Suspense for smooth, instant responses",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: FiShield,
      title: "Secure Authentication",
      description: "Enterprise-grade auth with Clerk, including social login support",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FiMic,
      title: "Voice Input & Output",
      description: "Speak to the chatbot and hear responses with Web Speech API",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: FiMessageSquare,
      title: "Multi-Turn Memory",
      description: "Intelligent context management for deep, meaningful conversations",
      color: "from-blue-500 to-cyan-500",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col overflow-y-auto">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-12 flex flex-col flex-1 w-full">
          {/* Header */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <FiMessageSquare className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-white">AI Chatbot</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm text-dark-200 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center mb-16 flex-shrink-0">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-2xl shadow-primary-500/30"
            >
              <FiMessageSquare className="text-white" size={40} />
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Your Intelligent
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                AI Assistant
              </span>
            </motion.h1>

            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-dark-300 max-w-2xl mx-auto mb-8"
            >
              Powered by Google Gemini with real-time streaming, voice
              capabilities, and intelligent conversation memory.
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-4"
            >
              <Link
                href="/sign-up"
                className="group flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                Start Chatting
                <FiArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              </Link>
              <Link
                href="/sign-in"
                className="px-8 py-3 border border-dark-600 hover:border-dark-500 text-dark-200 hover:text-white rounded-xl font-medium transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-shrink-0"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-5 rounded-2xl bg-dark-800/50 border border-dark-700/50 hover:border-dark-600 transition-all group"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:shadow-lg transition-shadow`}
                >
                  <feature.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 pt-6 pb-4 text-center"
          >
            <p className="text-sm text-dark-500 mb-4">Built with</p>
            <div className="flex items-center justify-center gap-6 flex-wrap text-dark-400">
              {[
                "Next.js 14",
                "React Server Components",
                "Clerk Auth",
                "Google Gemini",
                "MongoDB",
                "WebSockets",
                "Tailwind CSS",
              ].map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full border border-dark-700 hover:border-dark-600 hover:text-dark-300 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
