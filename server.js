const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  
  const io = new Server(server, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // WebSocket connection handling
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join a conversation room
    socket.on("join-conversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📝 ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`📝 ${socket.id} left conversation: ${conversationId}`);
    });

    // Broadcast message to conversation participants
    socket.on("message", (data) => {
      const { conversationId, message } = data;
      // Broadcast to all other clients in the same conversation
      socket.to(`conversation:${conversationId}`).emit("new-message", {
        conversationId,
        message,
      });
    });

    // Typing indicator
    socket.on("typing", (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation:${conversationId}`).emit("user-typing", {
        userId: socket.id,
        isTyping,
      });
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });

  server
    .once("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`
╔══════════════════════════════════════════════╗
║          🤖 AI Chatbot Server Ready          ║
╠══════════════════════════════════════════════╣
║  🌐 URL:       http://${hostname}:${port}         ║
║  🔌 WebSocket: Enabled                       ║
║  📦 Mode:      ${dev ? "Development" : "Production "}                   ║
╚══════════════════════════════════════════════╝
      `);
    });
});
