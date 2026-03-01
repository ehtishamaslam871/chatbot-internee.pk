import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    // Memory summary for long conversations
    memorySummary: {
      type: String,
      default: null,
    },
    // Last activity for sorting
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Message count for quick reference
    messageCount: {
      type: Number,
      default: 0,
    },
    // Conversation metadata
    model: {
      type: String,
      default: "gemini-1.5-flash",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for user's conversations sorted by last activity
ConversationSchema.index({ userId: 1, lastMessageAt: -1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

export default Conversation;
