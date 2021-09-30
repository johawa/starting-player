const { Namespace } = require("./utils/models/namespace");
const { PORT } = require("./utils/constants/constants");
const {
  handleUserMouseUp,
  handleUserPressedMouse,
  setCurrentPosition,
  handleJoin,
  handleDisconnect,
  handleRestartGameStart,
  handleRestartGameEnd,
} = require("./socket.handlers");
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
const WORKSPACE = io.of(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/);

io.on("new_namespace", (namespace) => {
  namespace.namespaceInstance = new Namespace(namespace.name, io);
});

WORKSPACE.on("connection", (socket) => {
  const namespaceInstance = socket.nsp.namespaceInstance;
  console.log(`Connected: ${socket.id}`);

  socket.emit("emitNewConnection", socket.id);
  socket.on("disconnect", async () => handleDisconnect(namespaceInstance, socket));
  socket.on("join", async (data) => handleJoin(namespaceInstance, socket, data));

  socket.on("userCursorPosition", (data) => setCurrentPosition(namespaceInstance, socket, data));
  socket.on("userMouseDown", async () => handleUserPressedMouse(namespaceInstance, socket));
  socket.on("userMouseUp", () => handleUserMouseUp(namespaceInstance, socket));

  socket.on("userRestartGameStart", async () => handleRestartGameStart(namespaceInstance, socket));
  socket.on("userRestartGameEnd", async () => handleRestartGameEnd(namespaceInstance, socket));
});
