import express from "express";
import { createServer } from "node:http";
import { Server, ServerOptions } from "socket.io";
import type { mouseMoveClient } from "./socket.schema";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
} as Partial<ServerOptions>);

// @Elliott This is where you would put your socket code for the live collaboration
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("userDisconnected", socket.id);
  });

  socket.on("mouseMove", (mousePosition: mouseMoveClient) => {
    io.emit("mouseMove", {
      id: socket.id,
      mousePosition,
    });
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
