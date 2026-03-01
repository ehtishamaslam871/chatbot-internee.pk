import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // For voice messages
    isVoiceMessage: {
      type: Boolean,
      default: false,
    },
    // Token usage tracking
    tokens: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient message retrieval
MessageSchema.index({ conversationId: 1, createdAt: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
