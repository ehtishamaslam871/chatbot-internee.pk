import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";
import { createChatSession, streamResponse, generateTitle } from "@/lib/gemini";
import {
  buildContextWithMemory,
  formatMessagesWithMemory,
} from "@/lib/memory";

/**
 * POST /api/chat
 * Send a message and receive a streaming AI response
 * Implements: Streaming, Multi-turn Memory, Optimistic UI support
 */
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId, isVoice = false } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
      });
      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
    } else {
      conversation = await Conversation.create({
        userId,
        title: "New Conversation",
      });
    }

    // Save user message
    const userMessage = await Message.create({
      conversationId: conversation._id,
      role: "user",
      content: message,
      isVoiceMessage: isVoice,
    });

    // Get conversation history for context
    const allMessages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .lean();

    // Build context with memory management (multi-turn)
    const memoryContext = await buildContextWithMemory(
      allMessages.map((m) => ({ role: m.role, content: m.content })),
      conversation.memorySummary
    );

    // Format messages with memory for Gemini
    const contextMessages = formatMessagesWithMemory(
      memoryContext.contextMessages,
      memoryContext.summary
    );

    // Update memory summary if needed
    if (memoryContext.needsSummarization && memoryContext.summary) {
      await Conversation.findByIdAndUpdate(conversation._id, {
        memorySummary: memoryContext.summary,
      });
    }

    // Create chat session with history
    const chat = createChatSession(contextMessages.slice(0, -1)); // Exclude last (current) message

    // Generate title for new conversations
    if (!conversationId || conversation.title === "New Conversation") {
      generateTitle(message)
        .then((title) => {
          Conversation.findByIdAndUpdate(conversation._id, { title }).exec();
        })
        .catch(console.error);
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          // Send conversation ID first
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "meta",
                conversationId: conversation._id.toString(),
                messageId: userMessage._id.toString(),
              })}\n\n`
            )
          );

          // Stream AI response
          for await (const chunk of streamResponse(chat, message)) {
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
              )
            );
          }

          // Save assistant message to database
          const assistantMessage = await Message.create({
            conversationId: conversation._id,
            role: "assistant",
            content: fullResponse,
          });

          // Update conversation metadata
          await Conversation.findByIdAndUpdate(conversation._id, {
            lastMessageAt: new Date(),
            $inc: { messageCount: 2 },
          });

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                assistantMessageId: assistantMessage._id.toString(),
              })}\n\n`
            )
          );
        } catch (error) {
          console.error("Streaming error:", error.message, error.stack);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                content: "An error occurred while generating the response.",
              })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error.message, error.stack);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
