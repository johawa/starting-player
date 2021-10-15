import React, { useRef, useState, useEffect } from "react";
import { WinnerCircle } from "../components/Game/WinnerCircle";
import { LooserCircle } from "../components/Game/LooserCircle";
import { renderName } from "../components/Game/RenderName";
import {
  initiateSocket,
  subscribeToNewConnection,
  disconnectSocket,
  sendCursorPositionData,
  subscribeToCursorPositionsData,
  sendUserMouseDown,
  subscribeToUserMouseDown,
  sendUserMouseUp,
  subscribeToUserMouseUp,
  subscribeToActiveUsers,
  subscribeToAllUserPressingMouseDown,
  subscribeToWinnerArray,
  sendInterceptRestartGameStart,
  sendInterceptRestartGameCancel,
  subscribeToUserInterceptRestartGameStart,
  subscribeToUserInterceptRestartGameCancel,
  subscribeToAllUserInterceptRestartCircle,
  subscribeToUserJoinOrDisconnect,
} from "../utils/socket.helpers";
import "../styles/Game.css";
import "../styles/Winner.css";
import "../styles/Looser.css";
import "../styles/GameEnded.css";

import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, dragAction, useDrag, useGesture } from "@use-gesture/react";

const log = console.log;

function GameMobile({ namespace, username }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);

  const [isPointerDown, setIsPointerDown] = useState({ pointerDown: false, x: 0, y: 0 });

  const touchStart = useGesture({
    onDrag: (state) => console.log(state),
  });

  useEffect(() => {
    if (namespace) initiateSocket(namespace, username);

    subscribeToNewConnection((err, mySocketId) => {
      if (err) return;
      initiatetOwnUser(mySocketId);
    });

    subscribeToUserJoinOrDisconnect();

    subscribeToActiveUsers((err, users) => {
      if (err) return;
      recordActiveUsers(users);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  // init Functions
  function initiatetOwnUser(id) {
    setMySocketId(id);
  }

  function recordActiveUsers(users) {
    setActiveUsers(users);
  }

  function handleOnPointerDown(ev) {
    console.log("on Pointer Down", ev);
    const newState = { pointerDown: true, x: ev.pageX, y: ev.pageY };
    setIsPointerDown(newState);
  }

  function renderOwnPLayer() {
    const { pointerDown, x, y } = isPointerDown;
    console.log(pointerDown, x, y);
    if (activeUsers && mySocketId && pointerDown === true) {
      const ownUser = activeUsers.filter((user) => user.id === mySocketId);

      return (
        <div className="cursor_wrapper" style={{ top: y, left: x }} key={mySocketId}>
          <div style={{ backgroundColor: "red", height: "80px", width: "80px" }}></div>
          {renderName(`(${ownUser[0]?.username}) - It's you `)}
        </div>
      );
    }
  }

  return (
    <>
      <div
        {...touchStart()}
        className="app"
        onPointerDown={handleOnPointerDown}
        onPointerCancel={() => console.log("cancel")}
      >
        {renderOwnPLayer()}
      </div>
    </>
  );
}

export default GameMobile;
