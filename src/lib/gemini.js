import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = "llama-3.3-70b-versatile";

// System prompt for the chatbot personality and behavior
const SYSTEM_PROMPT = `You are an intelligent, helpful, and friendly AI assistant. You provide clear, accurate, and detailed responses while being conversational. You remember context from the conversation and can refer back to previous messages. When you don't know something, you say so honestly. You can help with coding, writing, analysis, math, creative tasks, and general knowledge. Format your responses using markdown when appropriate.`;

/**
 * Create a chat session object with conversation history
 * @param {Array} history - Previous conversation messages
 * @returns {Object} Chat session with history and sendMessage methods
 */
export function createChatSession(history = []) {
  // Convert history to Groq/OpenAI format
  const formattedHistory = history.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }));

  return {
    history: formattedHistory,
    systemPrompt: SYSTEM_PROMPT,
  };
}

/**
 * Stream a response from Groq
 * @param {Object} chat - Chat session object
 * @param {string} message - User message
 * @returns {AsyncGenerator} Stream of text chunks
 */
export async function* streamResponse(chat, message) {
  const messages = [
    { role: "system", content: chat.systemPrompt },
    ...chat.history,
    { role: "user", content: message },
  ];

  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages,
    stream: true,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      yield text;
    }
  }
}

/**
 * Get a complete (non-streaming) response
 * @param {Object} chat - Chat session object
 * @param {string} message - User message
 * @returns {string} Complete response text
 */
export async function getResponse(chat, message) {
  const messages = [
    { role: "system", content: chat.systemPrompt },
    ...chat.history,
    { role: "user", content: message },
  ];

  const result = await groq.chat.completions.create({
    model: MODEL,
    messages,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 0.95,
  });

  return result.choices[0]?.message?.content || "";
}

/**
 * Generate a conversation title from the first message
 * @param {string} message - First user message
 * @returns {string} Generated title
 */
export async function generateTitle(message) {
  const result = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "user",
        content: `Generate a very short title (max 6 words) for a conversation that starts with this message. Return only the title, no quotes or extra text: "${message}"`,
      },
    ],
    max_tokens: 30,
    temperature: 0.7,
  });

  return (result.choices[0]?.message?.content || "New Conversation").trim();
}

export default groq;
