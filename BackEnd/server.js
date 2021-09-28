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

let timeleft = 1;
let downloadTimer;

class User {
  constructor(id, room, username, x, y) {
    this.id = id;
    this.room = room;
    this.username = username;
    this.clr = colors.sort(() => 0.5 - Math.random()).pop();
    this.x = x ? x : 80;
    this.y = y ? y : 80;
    this.isPressingMouseDown = false;
    this.isInterceptiongRestartCircle = false;
  }
}

class Room {
  static #roomCounter = 0;

  constructor(room) {
    Room.#roomCounter++;
    this.room = room;
    this.activeUsers = new Set();
  }

  addUser() {
    this.activeUsers.add(new User(socketId, room));
  }

  get roomCounter() {
    return Room.#roomCounter;
  }
}
const activeUsers = new Set();

const workspace = io.of(
  /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/
);

workspace.on("connection", (socket) => {
  const namespace = socket.nsp;
  // console.log('namespacename', namespace.name)

  console.log(`Connected: ${socket.id}`);
  socket.emit("emitNewConnection", socket.id);

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);

    activeUsers.forEach((user) => {
      if (user.id === socket.id) {
        activeUsers.delete(user);
      }
    });

    namespace.emit("emitActiveUsers", [...activeUsers.keys()]);
    // console.log(activeUsers);
  });

  socket.on("join", async (data) => {
    const { room, userName } = data;

    const gameInstance = new Room(room);

    // console.log(`Socket ${socket.id} joining ${room}`);
    const user = new User(socket.id);

    socket.data = user;
    socket.join(room);

    activeUsers.add(new User(socket.id, room));

    const sockets = await namespace.fetchSockets();
    const USRS = sockets.map((socket) => socket.data);
    console.log(USRS);

    /*     for (const socket of sockets) {
      console.log(socket.data);
    } */

    // namespace.emit("emitActiveUsers", [...activeUsers.keys()]);
    namespace.emit("emitActiveUsers", USRS);
    // console.log(activeUsers);
  });

  // mouseMove Start
  socket.on("cursorPosition", (data) => {
    const { room } = data;

    activeUsers.forEach((user) => {
      if (user.id === data.cords.id) {
        user.x = data.cords.x;
        user.y = data.cords.y;
        namespace.emit("emitCursorPositionsData", user);
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
        namespace.emit("emituserPressedMouse", user);
      }
    });

    if (determineIfAllUserArePressingMouseDown([...activeUsers.keys()])) {
      startTimer();
      namespace.emit("emitAllUserPressingMouseDown", true);
    }
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    const { id, room } = data;

    // cancel function when user Presses Up again
    namespace.emit("emitAllUserPressingMouseDown", false);
    stopTimer();

    activeUsers.forEach((user) => {
      if (user.id === id) {
        user.isPressingMouseDown = false;
        // console.log("userMouseUp", user);
      }
    });

    namespace.emit("emituserMouseUp", id);
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

    namespace.emit("emituserInterceptRestartCircleStart", [
      ...activeUsers.keys(),
    ]);

    if (
      determineIfAllUserAreInterceptingRestartCircle([...activeUsers.keys()])
    ) {
      namespace.emit("emitAllUserInterceptRestartCircle");
    }
  });

  // User Intercept End
  socket.on("userRestartGameEnd", (data) => {
    activeUsers.forEach((user) => {
      if (user.id === data.id) {
        user.isInterceptiongRestartCircle = false;
      }
    });

    namespace.emit("emituserInterceptRestartCircleCancel", [
      ...activeUsers.keys(),
    ]);
  });
});

function startTimer() {
  downloadTimer = setInterval(function () {
    if (timeleft <= 0) {
      // Event
      // DetermineWinner
      const winnerArray = determineWinner(activeUsers);
      namespace.emit("emitWinnerArray", winnerArray);

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
