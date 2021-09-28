import io from "socket.io-client";
let socket;

export const initiateSocket = (namespace, username) => {
  socket = io(`http://192.168.1.105:5000/${namespace}`);
  //console.log(`Connecting socket...`);
  if (socket && namespace) socket.emit("join", { username });
};

export const disconnectSocket = () => {
  //console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

// Gets MySocketId
export const subscribeToNewConnection = (cb) => {
  if (!socket) return true;
  socket.on("emitNewConnection", (msg) => {
    //console.log("Websocket event received! [emitNewConnection]");
    return cb(null, msg);
  });
};

// Users Start
export const subscribeToActiveUsers = (cb) => {
  if (!socket) return true;
  socket.on("emitActiveUsers", (msg) => {
    // console.log("Websocket event received! [emitActiveUsers]", msg);
    return cb(null, msg);
  });
};
// Users End

// mouseMove Start
export const subscribeToCursorPositionsData = (cb) => {
  if (!socket) return true;
  socket.on("emitCursorPositionsData", (msg) => {
    // console.log("Websocket event received! [subscribeToCursorPositionsData]");
    return cb(null, msg);
  });
};

export const sendCursorPositionData = (cords) => {
  if (socket) socket.emit("userCursorPosition", { cords });
};
// mouseMove End

// mousePressed Start
export const sendUserMouseDown = () => {
  if (socket) socket.emit("userMouseDown");
};

export const subscribeToUserMouseDown = (cb) => {
  if (!socket) return true;
  socket.on("emituserPressedMouse", (msg) => {
    console.log("Websocket event received! [emituserPressedMouse]", msg);
    return cb(null, msg);
  });
};

// mousePressed End

// mouseUp Start
export const sendUserMouseUp = () => {
  if (socket) socket.emit("userMouseUp");
};

export const subscribeToUserMouseUp = (cb) => {
  if (!socket) return true;
  socket.on("emituserMouseUp", (msg) => {
    //console.log("Websocket event received! [emituserMouseUp]");
    return cb(null, msg);
  });
};

// mouseUp End

// Events
// All Users Pressing Mouse Down
export const subscribeToAllUserPressingMouseDown = (cb) => {
  if (!socket) return true;
  socket.on("emitAllUserPressingMouseDown", (msg) => {
    /*   console.log(
      "Websocket event received! [emitAllUserPressingMouseDown]",
      msg
    ); */
    return cb(null, msg);
  });
};

// Winner / Game Ended
export const subscribeToWinnerArray = (cb) => {
  if (!socket) return true;
  socket.on("emitWinnerArray", (msg) => {
    // console.log("Websocket event received! [emitWinnerArray]", msg);
    return cb(null, msg);
  });
};

// Intercept Start
export const sendInterceptRestartGameStart = () => {
  if (socket) socket.emit("userRestartGameStart");
};

export const subscribeToUserInterceptRestartGameStart = (cb) => {
  if (!socket) return true;
  socket.on("emituserInterceptRestartCircleStart", (msg) => {
    //console.log("Websocket event received! [emituserInterceptRestartCircleStart]");
    return cb(null, msg);
  });
};

// Intercept End
export const sendInterceptRestartGameCancel = () => {
  if (socket) socket.emit("userRestartGameEnd");
};

export const subscribeToUserInterceptRestartGameCancel = (cb) => {
  if (!socket) return true;
  socket.on("emituserInterceptRestartCircleCancel", (msg) => {
    //console.log("Websocket event received! [emituserInterceptRestartCircleCancel]");
    return cb(null, msg);
  });
};

export const subscribeToAllUserInterceptRestartCircle = (cb) => {
  if (!socket) return true;
  socket.on("emitAllUserInterceptRestartCircle", () => {
    //console.log("Websocket event received! [emitAllUserInterceptRestartCircle]");
    return cb(null);
  });
};
