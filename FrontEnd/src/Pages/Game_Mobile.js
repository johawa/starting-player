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

import "../styles/Game_Mobile.css";

import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, dragAction, useDrag } from "@use-gesture/react";

const useGesture = createUseGesture([dragAction]);

const log = console.log;

function GameMobile({ namespace, username }) {
  const [timerAnimation, setTimerAnimation] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winnerArray, setWinnerArray] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);

  const [isPointerDown, setIsPointerDown] = useState({ pointerDown: false, PointerX: 0, PointerY: 0 });

  const [position, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 300 },
  }));

  const ref = React.useRef(null);

  const cursors = useRef([]);

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
    const newState = { pointerDown: true, PointerX: x, PointerY: y };
    setIsPointerDown(newState);
  }

  function handleDragEnd() {
    api.start({ x: 0, y: 0 });
    const newState = { pointerDown: false, PointerX: 0, PointerY: 0 };
    setIsPointerDown(newState);
  }

  function renderCursorState(id) {
    if (gameEnded === true && winnerArray) {
      const userWithPosition = winnerArray.filter((user) => user.id === id);
      const position = userWithPosition[0] ? userWithPosition[0].position + 1 : null;

      if (position && position === 1) {
        return (
          <>
            <div className="info_winner">🥇</div>
            <div className="cursor winner">
              <WinnerCircle></WinnerCircle>
            </div>
          </>
        );
      } else if (position && position !== 1) {
        return (
          <>
            <div className="info_looser">{position}</div>
            <div className="cursor looser">
              <LooserCircle finalRank={position}></LooserCircle>
            </div>
          </>
        );
      }
    } else if (gameEnded === false && !winnerArray) {
      return (
        <div className="cursor">
          <div className={timerAnimation ? "point_1 animationRev" : "point_1"}></div>
          <div className={timerAnimation ? "point_2 animation" : "point_2"}></div>
        </div>
      );
    }
  }

  function renderOtherPlayers() {
    if (activeUsers && mySocketId) {
      const otherUsers = activeUsers.filter((user) => user.id !== mySocketId);

      return otherUsers.map((user) => {
        return (
          <div
            ref={(element) => {
              cursors.current[`${user.id}`] = element;
            }}
            className="cursor_wrapper"
            key={user.id}
          >
            {renderCursorState(user.id)}
            {renderName(user.username)}
          </div>
        );
      });
    }
  }

  function renderOwnPLayer() {
    const { pointerDown, PointerX, PointerY } = isPointerDown;

    if (activeUsers && mySocketId) {
      const ownUser = activeUsers.filter((user) => user.id === mySocketId);
      return (
        <animated.div
          className="cursor_wrapper"
          style={{
            ...position,
            left: `${PointerX - 45}px`, // width (90px)/ 2
            top: `${PointerY - 45}px`, // height (90px)/ 2
            visibility: pointerDown ? "visible" : "hidden",
          }}
          key={mySocketId}
        >
          <div className="cursor_mobile"></div>
          {renderName(`(${ownUser[0]?.username}📱) - It's you `)}
        </animated.div>
      );
    }
  }

  return (
    <>
      <div className="app" ref={ref}>
        {renderOwnPLayer()}
        {renderOtherPlayers()}
      </div>
    </>
  );
}

export default GameMobile;
