/**
 * Conversation Memory Manager
 * Handles multi-turn conversation context and memory summarization
 */

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_CONTEXT_MESSAGES = 20; // Max messages to keep in active context
const SUMMARY_THRESHOLD = 15; // When to trigger summarization

/**
 * Build context window with memory management
 * Implements sliding window + summary approach for long conversations
 */
export async function buildContextWithMemory(messages, existingSummary = null) {
  if (messages.length <= MAX_CONTEXT_MESSAGES) {
    return {
      contextMessages: messages,
      summary: existingSummary,
      needsSummarization: false,
    };
  }

  // If we have too many messages, summarize older ones
  const oldMessages = messages.slice(0, messages.length - MAX_CONTEXT_MESSAGES);
  const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);

  let summary = existingSummary;

  if (oldMessages.length >= SUMMARY_THRESHOLD || !existingSummary) {
    summary = await summarizeMessages(oldMessages, existingSummary);
  }

  return {
    contextMessages: recentMessages,
    summary,
    needsSummarization: true,
  };
}

/**
 * Summarize a set of messages into a concise context summary
 */
async function summarizeMessages(messages, previousSummary = null) {
  const messagesText = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const prompt = previousSummary
    ? `Previous conversation summary: ${previousSummary}\n\nNew messages to incorporate:\n${messagesText}\n\nCreate an updated concise summary of the full conversation so far. Focus on key topics, decisions, user preferences, and important context. Keep it under 500 words.`
    : `Summarize this conversation concisely, focusing on key topics, decisions, user preferences, and important context. Keep it under 500 words:\n\n${messagesText}`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
    temperature: 0.5,
  });

  return result.choices[0]?.message?.content || "";
}

/**
 * Format messages for Gemini API with memory context
 */
export function formatMessagesWithMemory(contextMessages, summary) {
  const formatted = [];

  if (summary) {
    // Inject summary as the first message for context
    formatted.push({
      role: "user",
      content: `[System Context - Previous conversation summary: ${summary}]`,
    });
    formatted.push({
      role: "assistant",
      content:
        "I understand the previous context. I'll keep this in mind as we continue our conversation.",
    });
  }

  formatted.push(...contextMessages);
  return formatted;
}

export default { buildContextWithMemory, formatMessagesWithMemory };
