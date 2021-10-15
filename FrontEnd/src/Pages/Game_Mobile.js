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
import { createUseGesture, dragAction, useDrag } from "@use-gesture/react";

const useGesture = createUseGesture([dragAction]);

const log = console.log;

function GameMobile({ namespace, username }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);

  const [isPointerDown, setIsPointerDown] = useState({ pointerDown: false, MyX: 0, MyY: 0 });

  const [position, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }));

  const ref = React.useRef(null);

  useGesture(
    {
      onDragStart: ({ xy: [x, y] }) => handleDragStart(x, y),
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
      onDragEnd: () => handleDragEnd(),
    },
    {
      target: ref,
      drag: { from: () => [position.x.get(), position.y.get()] },
    }
  );

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

  function handleDragStart(x, y, state) {
    console.log(state);
    const newState = { pointerDown: true, MyX: x, MyY: y };
    setIsPointerDown(newState);
  }

  function handleDragEnd() {
    api.start({ x: 0, y: 0 });
    const newState = { pointerDown: false, MyX: 0, MyY: 0 };
    setIsPointerDown(newState);
  }

  function renderOwnPLayer() {
    const { pointerDown, MyX, MyY } = isPointerDown;
    console.log({ position }, MyX, MyY);

    if (activeUsers && mySocketId) {
      const ownUser = activeUsers.filter((user) => user.id === mySocketId);

      return (
        <animated.div
          className="cursor_wrapper"
          style={{
            ...position,
            left: `${MyX - 40}px`,
            top: `${MyY - 40}px`,
            visibility: pointerDown ? "visible" : "hidden",
          }}
          key={mySocketId}
        >
          <div style={{ backgroundColor: "red", height: "80px", width: "80px" }}></div>
          {renderName(`(${ownUser[0]?.username}) - It's you `)}
        </animated.div>
      );
    }
  }

  return (
    <>
      <div className="app" ref={ref}>
        {renderOwnPLayer()}
      </div>
    </>
  );
}

export default GameMobile;
