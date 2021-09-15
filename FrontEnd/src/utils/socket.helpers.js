import io from "socket.io-client";
let socket;

export const initiateSocket = (room) => {
  socket = io("http://192.168.1.104:5000");
  console.log(`Connecting socket...`);
  if (socket && room) socket.emit("join", room);
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

// Gets MySocketId
export const subscribeToNewConnection = (cb) => {
  if (!socket) return true;
  socket.on("emitNewConnection", (msg) => {
    console.log("Websocket event received! [emitNewConnection]");
    return cb(null, msg);
  });
};

// Users Start
export const subscribeToActiveUsers = (cb) => {
  if (!socket) return true;
  socket.on("emitActiveUsers", (msg) => {
    console.log("Websocket event received! [emitActiveUsers]", msg);
    return cb(null, msg);
  });
};
// Users End

// mouseMove Start
export const subscribeToCursorPositionsData = (cb) => {
  if (!socket) return true;
  socket.on("emitCursorPositionsData", (msg) => {
    console.log("Websocket event received! [subscribeToCursorPositionsData]");
    return cb(null, msg);
  });
};

export const sendCursorPositionData = (cords, room) => {
  if (socket) socket.emit("cursorPosition", { cords, room });
};
// mouseMove End

// mousePressed Start
export const sendUserMouseDown = (id, room) => {
  if (socket) socket.emit("userPressedMouse", { id, room });
};

export const subscribeToUserMouseDown = (cb) => {
  if (!socket) return true;
  socket.on("emituserPressedMouse", (msg) => {
    console.log("Websocket event received! [emituserPressedMouse]");
    return cb(null, msg);
  });
};

// mousePressed End

// mouseUp Start
export const sendUserMouseUp = (id, room) => {
  if (socket) socket.emit("userMouseUp", { id, room });
};

export const subscribeToUserMouseUp = (cb) => {
  if (!socket) return true;
  socket.on("emituserMouseUp", (msg) => {
    console.log("Websocket event received! [emituserMouseUp]");
    return cb(null, msg);
  });
};

// mouseUp End

// Events
// All Users Pressing Mouse Down
export const subscribeToAllUserPressingMouseDown = (cb) => {
  if (!socket) return true;
  socket.on("emitAllUserPressingMouseDown", (msg) => {
    console.log(
      "Websocket event received! [emitAllUserPressingMouseDown]",
      msg
    );
    return cb(null, msg);
  });
};

// DEV

export const getWinnerArray = (room) => {
  if (socket) socket.emit("getWinnerArray", room);
};

export const subscribeToWinnerArray = (cb) => {
  if (!socket) return true;
  socket.on("emitWinnerArray", (msg) => {
    console.log("Websocket event received! [emitWinnerArray]", msg);
    return cb(null, msg);
  });
};
