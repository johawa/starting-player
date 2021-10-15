const {
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
  checkForDuplicateName,
} = require("./utils/utils");
const { User } = require("./utils/models/user");

const log = console.log;

async function handleJoin(namespaceInstance, socket, data) {
  const { username, isMobile } = data;
  if (!namespaceInstance) return;
  let activeUsers = await namespaceInstance?.getActiveUsers();

  const uniqueUsername = checkForDuplicateName(username, activeUsers);
  // console.log(`Socket ${socket.id} joining  with name ${uniqueUsername}`);

  const user = new User(socket.id, uniqueUsername, isMobile);
  socket.data = user;

  // Update after adding User
  activeUsers = await namespaceInstance?.getActiveUsers();

  socket.broadcast.emit("emitUserJoinOrDisconnect", { username: uniqueUsername, type: "join" });

  namespaceInstance?.connection.emit("emitActiveUsers", activeUsers);
}

async function handleDisconnect(namespaceInstance, socket) {
  if (!namespaceInstance) return;
  socket.broadcast.emit("emitUserJoinOrDisconnect", { username: socket.data.username, type: "disconnect" });
  const activeUsers = await namespaceInstance?.getActiveUsers();
  console.log("disconnect", activeUsers);
  namespaceInstance?.connection.emit("emitActiveUsers", activeUsers);

  if (activeUsers.length === 0) {
    console.log(`clear Namespace, active namespaceInstances: ${socket.nsp.namespaceInstance?.id - 1}`);
    // delete socket.nsp.namespaceInstance;
  }
}

function handleUserMouseUp(namespaceInstance, socket) {
  // cancel function when user Presses Up again
  if (Object.keys(socket.data).length === 0) return;
  namespaceInstance?.connection.emit("emitAllUserPressingMouseDown", false);
  namespaceInstance?.stopTimer();

  if (Object.keys(socket.data).length === 0) return;
  socket.data.setPressingMouseDown(false);

  namespaceInstance?.connection.emit("emituserMouseUp", socket.id);
}

async function handleUserPressedMouse(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;

  socket.data.setPressingMouseDown(true);
  console.log(socket.data);
  namespaceInstance?.connection.emit("emituserPressedMouse", socket.data);
  const activeUsers = await namespaceInstance?.getActiveUsers();

  if (determineIfAllUserArePressingMouseDown(activeUsers)) {
    // Start Time and Emit Winners array if timer runs to 0
    namespaceInstance?.startTimer().then(() => {
      const winnerArray = determineWinner(activeUsers);
      namespaceInstance?.connection.emit("emitWinnerArray", winnerArray);
    });
    namespaceInstance?.connection.emit("emitAllUserPressingMouseDown", true);
  }
}

function setCurrentPosition(namespaceInstance, socket, data) {
  const { cords } = data;
  if (Object.keys(socket.data).length === 0) return;

  socket.data.setCords(cords.x, cords.y);

  namespaceInstance?.connection.emit("emitCursorPositionsData", socket.data);
}

async function handleRestartGameStart(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;
  socket.data.setIsInterceptiongRestartCircle(true);

  const activeUsers = await namespaceInstance?.getActiveUsers();
  namespaceInstance?.connection.emit("emituserInterceptRestartCircleStart", activeUsers);

  if (determineIfAllUserAreInterceptingRestartCircle(activeUsers)) {
    namespaceInstance?.connection.emit("emitAllUserInterceptRestartCircle");
  }
}

async function handleRestartGameEnd(namespaceInstance, socket) {
  if (Object.keys(socket.data).length === 0) return;
  socket.data.setIsInterceptiongRestartCircle(false);

  const activeUsers = await namespaceInstance?.getActiveUsers();
  namespaceInstance?.connection.emit("emituserInterceptRestartCircleCancel", activeUsers);
}

module.exports = {
  handleJoin,
  handleDisconnect,
  handleUserMouseUp,
  handleUserPressedMouse,
  setCurrentPosition,
  handleRestartGameStart,
  handleRestartGameEnd,
};
