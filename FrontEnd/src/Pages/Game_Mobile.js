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

function GameMobile({ namespace, username }) {
  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);

  const cursors = useRef([]);

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

  function renderOwnPLayer() {
    if (activeUsers && mySocketId) {
      const ownUser = activeUsers.filter((user) => user.id === mySocketId);
      console.log({ ownUser });

      /*   if (ownUser[0]?.isMobile === true) {
        return <animated.div {...bind()} style={{ x, y }} className="test" />;
      } */
      return (
        <div
          ref={(element) => {
            cursors.current[`${mySocketId}`] = element;
          }}
          className="cursor_wrapper"
          key={mySocketId}
        >
          <div style={{ backgroundColor: "red", height: "80px", width: "80px" }}></div>
          {renderName(`(${ownUser[0]?.username}) - It's you `)}
        </div>
      );
    }
  }

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }));
  const bind = useDrag(({ offset: [x, y], down }) => api.start({ x, y }, console.log("down", down)));

  const touchStart = useDrag((state) => console.log("down", state.offset));

  return (
    <>
      <animated.div {...touchStart()} className="app">
        {renderOwnPLayer()}
      </animated.div>
    </>
  );
}

export default GameMobile;
