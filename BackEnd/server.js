const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
  startTimer,
  stopTimer,
  User
} = require("./utils");
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
    const { namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    if (Object.keys(socket.data).length === 0) return;
    socket.data.setIsInterceptiongRestartCircle(true);

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
    const { namespace } = data;
    const namespaceInstance = io.of(`${namespace}`);

    if (Object.keys(socket.data).length === 0) return;
    socket.data.setIsInterceptiongRestartCircle(false);

    // get active users array
    const sockets = await namespaceInstance.fetchSockets();
    const users = sockets.map((socket) => socket.data);

    namespaceInstance.emit("emituserInterceptRestartCircleCancel", users);
  });
});