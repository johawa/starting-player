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
const io = socket(server, { cors: true });

const activeUsers = new Set();

class User {
  constructor(id, clr, x, y) {
    this.id = id;
    this.clr = clr ? clr : "gray";
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }
}

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);
  socket.emit("emitNewConnection", socket.id);

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    activeUsers.forEach((user) => {
      if (user.id === socket.id) {
        activeUsers.delete(user);
      }
    });

    io.emit("emitActiveUsers", [...activeUsers.keys()]);
    console.log(activeUsers);
  });

  socket.on("join", (room) => {
    console.log(`Socket ${socket.id} joining ${room}`);
    socket.join(room);

    activeUsers.add(new User(socket.id));

    io.emit("emitActiveUsers", [...activeUsers.keys()]);
    console.log(activeUsers);
  });

  // mouseMove Start
  socket.on("cursorPosition", (data) => {    
    console.log(data);

    io.to(data.room).emit("emitCursorPositionsData", data);
  });
  // mouseMove End

  // mousePressed Start
  socket.on("playerPressedMouse", (data) => {
    const { player, room } = data;
    // console.log(`playerPressedMouse: ${player}, room: ${room}`);
    io.to(room).emit("emitplayerPressedMouse", player);
  });
  // mousePressed End

  // mouseUp Start
  socket.on("playerMouseUp", (data) => {
    const { player, room } = data;
    // console.log(`playerMouseUp: ${player}, room: ${room}`);
    io.to(room).emit("emitplayerMouseUp", player);
  });
  // mouseUp End
});
