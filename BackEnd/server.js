const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
} = require("./utils");
const { User } = require("./models/user");
const { Namespace } = require("./models/namespace");
const { PORT } = require("./constants/constants");
const express = require("express");
const socket = require("socket.io");

// App setup
const app = express();
const server = app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});
// Socket setup
const io = socket(server, { cors: true });

const workspace = io.of(
  /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/
);

workspace.on("connection", (socket) => {
  const namespaceRef = new Namespace(socket.nsp.name, io);

  console.log(`Connected: ${socket.id}`);
  socket.emit("emitNewConnection", socket.id);

  socket.on("disconnect", async () => {
    // console.log(`Disconnected: ${socket.id}`);
    const users = await namespaceRef.getActiveUsers();
    console.log("join", users);
    // console.log(users);

    namespaceRef.connection.emit("emitActiveUsers", users);
  });

  socket.on("join", async (data) => {
    const { username } = data;
    // console.log(`Socket ${socket.id} joining namespace ${namespace.name}`);

    const user = new User(socket.id, username);
    socket.data = user;

    const users = await namespaceRef.getActiveUsers();
    console.log("join", users);

    namespaceRef.connection.emit("emitActiveUsers", users);
  });

  // mouseMove Start
  socket.on("cursorPosition", (data) => {
    const { cords } = data;

    if (Object.keys(socket.data).length === 0) return;
    // set cords data of socket
    socket.data.setCords(cords.x, cords.y);

    // emit socket.data
    namespaceRef.connection.emit("emitCursorPositionsData", socket.data);
  });
  // mouseMove End

  // mousePressed Start
  socket.on("userPressedMouse", async (data) => {
    if (Object.keys(socket.data).length === 0) return;
    // set user mouse Down
    socket.data.setPressingMouseDown(true);
    // emit socket.data
    namespaceRef.connection.emit("emituserPressedMouse", socket.data);

    // get active users array
    const users = await namespaceRef.getActiveUsers();

    if (determineIfAllUserArePressingMouseDown(users)) {
      // Start Time and Emit Winners array if timer runs to 0
      namespaceRef.startTimer().then(() => {
        const winnerArray = determineWinner(users);
        namespaceRef.connection.emit("emitWinnerArray", winnerArray);
      });
      namespaceRef.connection.emit("emitAllUserPressingMouseDown", true);
    }
  });
  // mousePressed End

  // mouseUp Start
  socket.on("userMouseUp", (data) => {
    // cancel function when user Presses Up again
    namespaceRef.connection.emit("emitAllUserPressingMouseDown", false);
    namespaceRef.stopTimer();

    if (Object.keys(socket.data).length === 0) return;
    socket.data.setPressingMouseDown(false);

    namespaceRef.connection.emit("emituserMouseUp", socket.id);
  });

  // mouseUp End

  // Game Ended
  // User Intercept Start
  socket.on("userRestartGameStart", async (data) => {
    if (Object.keys(socket.data).length === 0) return;
    socket.data.setIsInterceptiongRestartCircle(true);

    // get active users array
    const users = await namespaceRef.getActiveUsers();

    namespaceRef.connection.emit("emituserInterceptRestartCircleStart", users);

    if (determineIfAllUserAreInterceptingRestartCircle(users)) {
      namespaceRef.connection.emit("emitAllUserInterceptRestartCircle");
    }
  });

  // User Intercept End
  socket.on("userRestartGameEnd", async (data) => {
    if (Object.keys(socket.data).length === 0) return;
    socket.data.setIsInterceptiongRestartCircle(false);

    // get active users array
    const users = await namespaceRef.getActiveUsers();

    namespaceRef.connection.emit("emituserInterceptRestartCircleCancel", users);
  });
});
