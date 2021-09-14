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
    this.isPressingMouseDown = false;
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
    activeUsers.forEach((user) => {
      if (user.id === id) {
        user.isPressingMouseDown = true;
        // console.log("userMouseDown", user);
      }
    });

    io.to(room).emit("emituserPressedMouse", id);

    if (determineIfAllUserArePressingMouseDown([...activeUsers.keys()])) {
      io.to(room).emit("emitAllUserPressingMouseDown", true);
    }
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    const { id, room } = data;
    activeUsers.forEach((user) => {
      if (user.id === id) {
        user.isPressingMouseDown = false;
        // console.log("userMouseUp", user);
      }
    });

    // cancel function when user Presses Up again
    io.to(room).emit("emitAllUserPressingMouseDown", false);

    io.to(room).emit("emituserMouseUp", id);
  });
  // mouseUp End
});

function determineIfAllUserArePressingMouseDown(users) {
  let boolean;

  users.forEach((user) => {
    if (user.isPressingMouseDown === false) {
      boolean = false;
      return;
    } else {
      boolean = true;
    }
  });

  return boolean;
}

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
