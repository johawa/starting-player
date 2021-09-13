import io from "socket.io-client";
let socket;

export const initiateSocket = (room) => {
  socket = io("http://localhost:5000");
  console.log(`Connecting socket...`);
  if (socket && room) socket.emit("join", room);
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) socket.disconnect();
};

export const subscribeToChat = (cb) => {
  if (!socket) return true;
  socket.on("emitMousePosition", (msg) => {
    console.log("Websocket event received!");
    return cb(null, msg);
  });
};

export const sendMouseMoveData = (room, cords) => {
  if (socket) socket.emit("mouseMove", { cords, room });
};
