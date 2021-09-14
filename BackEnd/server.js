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
    //TODO sync movement data with user object, to sync position on gamestart
    io.to(data.room).emit("emitCursorPositionsData", data);
  });
  // mouseMove End

  // mousePressed Start
  socket.on("userPressedMouse", (data) => {
    const { id, room } = data;
    console.log(`userPressedMouse: ${id}, room: ${room}`);
    io.to(room).emit("emituserPressedMouse", id);
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    const { id, room } = data;
    console.log(`userMouseUp: ${id}, room: ${room}`);
    io.to(room).emit("emituserMouseUp", id);
  });
  // mouseUp End
});

/*     let timeleft = 2;
    var downloadTimer = setInterval(function () {
      if (timeleft <= 0) {
        determineWinner(playerName);
        clearInterval(downloadTimer);
      }
      console.log("count seconds", timeleft);
      timeleft -= 1;
    }, 1000);

    setAnimate(true); */
