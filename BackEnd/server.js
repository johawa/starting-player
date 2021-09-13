const express = require("express");
const socket = require("socket.io");

// App setup
const PORT = 5000;
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Socket setup
const io = socket(server, { cors: true, origins: ['192.168.1.104'] });

const activeUsers = new Set();

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("disconnect", () => console.log(`Disconnected: ${socket.id}`));

  socket.on("join", (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);
  });

  socket.on("cursorPosition", (data) => {
    const { cords, room } = data;
    console.log(`cords: ${cords}, room: ${room}`);
    io.to(room).emit("emitCursorPositionsData", cords);
  });


});
