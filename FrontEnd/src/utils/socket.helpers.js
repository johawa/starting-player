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
export const sendPlayerPressedMouse = (player, room) => {
  if (socket) socket.emit("playerPressedMouse", { player, room });
};

export const subscribeToPlayerPressedMouse = (cb) => {
  if (!socket) return true;
  socket.on("emitplayerPressedMouse", (msg) => {
    console.log("Websocket event received! [emitplayerPressedMouse]");
    return cb(null, msg);
  });
};

// mousePressed End

// mouseUp Start
export const sendPlayerMouseUp = (player, room) => {
  if (socket) socket.emit("playerMouseUp", { player, room });
};

export const subscribeToPlayerMouseUp = (cb) => {
    if (!socket) return true;
    socket.on("emitplayerMouseUp", (msg) => {
      console.log("Websocket event received! [emitplayerMouseUp]");
      return cb(null, msg);
    });
  };

// mouseUp End
