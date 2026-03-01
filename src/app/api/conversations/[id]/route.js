import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Conversation from "@/models/Conversation";
import Message from "@/models/Message";

/**
 * GET /api/conversations/[id]
 * Get a specific conversation with its messages
 */
export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const conversation = await Conversation.findOne({
      _id: id,
      userId,
    }).lean();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      conversation,
      messages: messages.map((m) => ({
        _id: m._id.toString(),
        role: m.role,
        content: m.content,
        isVoiceMessage: m.isVoiceMessage,
        createdAt: m.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete a conversation and all its messages
 */
export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const conversation = await Conversation.findOne({ _id: id, userId });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversationId: id });
    // Delete the conversation
    await Conversation.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation (rename, archive)
 */
export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const updates = await request.json();
    await connectDB();

    const allowedUpdates = {};
    if (updates.title) allowedUpdates.title = updates.title;
    if (typeof updates.isArchived === "boolean")
      allowedUpdates.isArchived = updates.isArchived;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: id, userId },
      allowedUpdates,
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error("Update conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
