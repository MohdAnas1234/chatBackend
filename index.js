const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://cool-naiad-82c39d.netlify.app"],
    methods: ["GET", "POST"],
  },
});

// Store users per room
const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ username, room }) => {
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });

    io.to(room).emit("user connected", `${username} joined the room`);

    io.to(room).emit("userList", rooms[room].map((u) => u.username));
  });

  socket.on("createRoom", ({ username, room }) => {
    socket.join(room);

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push({ id: socket.id, username });

    io.to(room).emit("user connected", `${username} created the room`);

    io.to(room).emit("userList", rooms[room].map((u) => u.username));
  });

  socket.on("chat message", ({ room, message, username }) => {
    io.to(room).emit("chat message", { username, message });
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter((u) => u.id !== socket.id);

      io.to(room).emit("user disconnected", "A user has left");

      io.to(room).emit(
        "userList",
        rooms[room].map((u) => u.username)
      );
    }
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
