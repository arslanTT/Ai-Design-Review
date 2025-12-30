import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.route.js";
import designRoutes from "./routes/design.route.js";
import commentRoutes from "./routes/comment.routes.js";
import connectToDB from "./config/db.js";
import { setupDesignCritiqueEvent } from "./services/designCritiqueEvent.service.js";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import seed from "./scripts/script.js";
dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins a room specifically for this design
  socket.on("join-design", (designId) => {
    socket.join(designId);
    console.log(`Socket ${socket.id} joined room for design: ${designId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

connectToDB();
seed();
setupDesignCritiqueEvent();

app.use("/auth", userRoutes);
app.use("/design", designRoutes);
app.use("/comments", commentRoutes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "Design Critique API",
  });
});

const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO is ready for connections`);
});

export { io };
