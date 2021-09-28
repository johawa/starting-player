const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
} = require("./utils");
/* const { User } = require("./User.model"); */
const express = require("express");
const socket = require("socket.io");
const { restart } = require("nodemon");

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

  setCords(x, y) {
    this.x = x;
    this.y = y;
  }

  setPressingMouseDown(bln) {
    this.isPressingMouseDown = bln;
  }

  setIsInterceptiongRestartCircle(bln) {
    this.isInterceptiongRestartCircle = bln;
  }
}

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

const activeUsers = new Set();

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

const workspace = io.of(
  /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/
);

workspace.on("connection", (socket) => {
  const namespace = socket.nsp;
  // console.log('namespacename', namespace.name)

  console.log(`Connected: ${socket.id}`);
  socket.emit("emitNewConnection", socket.id);

  socket.on("disconnect", async () => {
    // console.log(`Disconnected: ${socket.id}`);
    // get active users array
    const sockets = await namespace.fetchSockets();
    const users = sockets.map((socket) => socket.data);
    // console.log(users);

    namespace.emit("emitActiveUsers", users);
  });

  socket.on("join", async (data) => {
    const { username } = data;
    // console.log(`Socket ${socket.id} joining namespace ${namespace.name}`);
    // set new User
    const user = new User(socket.id, username);
    socket.data = user;

    // get active users array
    const sockets = await namespace.fetchSockets();
    const users = sockets.map((socket) => socket.data);
    // console.log(users);
    // console.log(`Active Users in namespace ${namespace.name}: ${users.length}`);

    namespace.emit("emitActiveUsers", users);
  });

  // mouseMove Start
  socket.on("cursorPosition", (data) => {
    const { cords, namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    if (Object.keys(socket.data).length === 0) return;
    // set cords data of socket
    socket.data.setCords(cords.x, cords.y);

    // emit socket.data
    namespaceInstance.emit("emitCursorPositionsData", socket.data);
  });
  // mouseMove End

  // mousePressed Start
  socket.on("userPressedMouse", async (data) => {
    const { namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    if (Object.keys(socket.data).length === 0) return;
    // set user mouse Down
    socket.data.setPressingMouseDown(true);
    // emit socket.data
    namespaceInstance.emit("emituserPressedMouse", socket.data);

    // get active users array
    const sockets = await namespaceInstance.fetchSockets();
    const users = sockets.map((socket) => socket.data);

    if (determineIfAllUserArePressingMouseDown(users)) {
      // Start Time and Emit Winners array if timer runs to 0
      startTimer().then(() => {
        const winnerArray = determineWinner(users);
        namespaceInstance.emit("emitWinnerArray", winnerArray);
      });
      namespaceInstance.emit("emitAllUserPressingMouseDown", true);
    }
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    const { namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    // cancel function when user Presses Up again
    namespaceInstance.emit("emitAllUserPressingMouseDown", false);
    stopTimer();

    if (Object.keys(socket.data).length === 0) return;
    socket.data.setPressingMouseDown(false);

    namespaceInstance.emit("emituserMouseUp", socket.id);
  });

  // mouseUp End

  // Game Ended
  // User Intercept Start
  socket.on("userRestartGameStart", async (data) => {
    const { cords, namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);
    // TODO only emit on Changes !
    if (Object.keys(socket.data).length === 0) return;
    socket.data.setPressingMouseDown(false);

    socket.data.setIsInterceptiongRestartCircle(true);

    /*     activeUsers.forEach((user) => {
      if (user.id === data.id) {
        user.isInterceptiongRestartCircle = true;
      }
    }); */

    /*     namespace.emit("emituserInterceptRestartCircleStart", [
      ...activeUsers.keys(),
    ]); */

    // get active users array
    const sockets = await namespaceInstance.fetchSockets();
    const users = sockets.map((socket) => socket.data);

    namespaceInstance.emit("emituserInterceptRestartCircleStart", users);

    if (determineIfAllUserAreInterceptingRestartCircle(users)) {
      namespaceInstance.emit("emitAllUserInterceptRestartCircle");
    }
  });

  // User Intercept End
  socket.on("userRestartGameEnd", async (data) => {
    const { cords, namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    socket.data.setIsInterceptiongRestartCircle(false);

    // get active users array
    const sockets = await namespaceInstance.fetchSockets();
    const users = sockets.map((socket) => socket.data);

    /*     activeUsers.forEach((user) => {
      if (user.id === data.id) {
        user.isInterceptiongRestartCircle = false;
      }
    }); */

    namespaceInstance.emit("emituserInterceptRestartCircleCancel", users);
  });
});

function startTimer() {
  return new Promise((resolve) => {
    downloadTimer = setInterval(() => {
      if (timeleft <= 0) {
        resolve("done");
        clearInterval(downloadTimer);
      }
      console.log("count seconds", timeleft);
      timeleft -= 1;
    }, 1000);
  });
}

function stopTimer() {
  clearInterval(downloadTimer);
  timeleft = 1;
}
