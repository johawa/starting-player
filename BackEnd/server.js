const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
} = require("./utils");
const express = require("express");
const socket = require("socket.io");

const colors = [
  "#F4DF4EFF",
  "#FC766AFF",
  "#5B84B1FF",
  "#5F4B8BFF",
  "#42EADDFF",
  "#CDB599FF",
  "#00A4CCFF",
  "#F95700FF",
  "#2C5F2D",
  "#00539CFF",
  "#B1624EFF",
];

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
let timeleft = 1;
let downloadTimer;

class User {
  constructor(id, room, x, y) {
    this.id = id;
    this.room = room;
    this.clr = colors.sort(() => 0.5 - Math.random()).pop();
    this.x = x ? x : 80;
    this.y = y ? y : 80;
    this.isPressingMouseDown = false;
    this.isInterceptiongRestartCircle = false;
  }
}

class Game {
  static id = 0;

  constructor(room) {
    this.room = room;
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
    // console.log(activeUsers);
  });

  socket.on("join", (room) => {
    if (!room) console.log(`Socket ${socket.id} joining ${room}`);

    socket.join(room);

    activeUsers.add(new User(socket.id));

    io.emit("emitActiveUsers", [...activeUsers.keys()]);
    // console.log(activeUsers);
  });

  // mouseMove Start
  socket.on("cursorPosition", (data) => {
    activeUsers.forEach((user) => {
      if (user.id === data.cords.id) {
        user.x = data.cords.x;
        user.y = data.cords.y;
        io.to(data.room).emit("emitCursorPositionsData", user);
      }
    });
  });
  // mouseMove End

  // mousePressed Start
  socket.on("userPressedMouse", (data) => {
    const { id, room } = data;

    activeUsers.forEach((user) => {
      if (user.id === id) {
        user.isPressingMouseDown = true;
        io.to(room).emit("emituserPressedMouse", user);
      }
    });

    if (determineIfAllUserArePressingMouseDown([...activeUsers.keys()])) {
      startTimer();
      io.to(room).emit("emitAllUserPressingMouseDown", true);
    }
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    const { id, room } = data;

    // cancel function when user Presses Up again
    io.to(room).emit("emitAllUserPressingMouseDown", false);
    stopTimer();

    activeUsers.forEach((user) => {
      if (user.id === id) {
        user.isPressingMouseDown = false;
        // console.log("userMouseUp", user);
      }
    });

    io.to(room).emit("emituserMouseUp", id);
  });

  // mouseUp End

  // Game Ended
  // User Intercept Start
  socket.on("userRestartGameStart", (data) => {
    // TODO only emit on Chnages !

    activeUsers.forEach((user) => {
      if (user.id === data.id) {
        user.isInterceptiongRestartCircle = true;
      }
    });

    io.emit("emituserInterceptRestartCircleStart", [...activeUsers.keys()]);

    if (
      determineIfAllUserAreInterceptingRestartCircle([...activeUsers.keys()])
    ) {
      io.emit("emitAllUserInterceptRestartCircle");
    }
  });

  // User Intercept End
  socket.on("userRestartGameEnd", (data) => {
    activeUsers.forEach((user) => {
      if (user.id === data.id) {
        user.isInterceptiongRestartCircle = false;
      }
    });

    io.emit("emituserInterceptRestartCircleCancel", [...activeUsers.keys()]);
  });
});

function startTimer() {
  downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      // Event
      // DetermineWinner
      const winnerArray = determineWinner(activeUsers);
      io.emit("emitWinnerArray", winnerArray);

      clearInterval(downloadTimer);
    }
    console.log("count seconds", timeleft);
    timeleft -= 1;
  }, 1000);
}

function stopTimer() {
  clearInterval(downloadTimer);
  timeleft = 1;
}
