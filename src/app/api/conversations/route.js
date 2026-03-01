import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";

/**
 * GET /api/conversations
 * List all conversations for the authenticated user
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find({
      userId,
      isArchived: false,
    })
      .sort({ lastMessageAt: -1 })
      .select("title lastMessageAt messageCount createdAt")
      .lean();

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversation = await Conversation.create({
      userId,
      title: "New Conversation",
    });

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
