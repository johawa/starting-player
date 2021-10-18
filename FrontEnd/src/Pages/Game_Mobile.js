import React, { useRef, useState, useEffect } from "react";
import { WinnerCircle } from "../components/Game/Cursor/WinnerCircle";
import { LooserCircle } from "../components/Game/Cursor/LooserCircle";
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
      onDrag: ({ pinching, cancel, offset: [x, y], ...state }) => {
        if (pinching) return cancel();
        api.start({ x, y });
        handleOnDrag(x, y, state);
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

    subscribeToCursorPositionsData((err, cords) => {
      if (err) return;
      setCursorPosition(cords);
    });

    subscribeToUserMouseDown((err, id) => {
      if (err) return;
      userIsPressingMouseDown(id);
    });

    subscribeToUserMouseUp((err, player) => {
      if (err) return;
      userIsPressingMouseUp(player);
    });

    subscribeToAllUserPressingMouseDown((err, boolean) => {
      if (err) return;
      allUserPressingMouseDown(boolean);
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

  function setCursorPosition(user) {
    const socketId = user.id;
    const radius = 80;

    if (socketId && cursors.current[`${socketId}`] && activeUsers) {
      cursors.current[`${socketId}`].style.top = `+${user.y - radius}px`;
      cursors.current[`${socketId}`].style.left = `+${user.x - radius}px`;
    }
  }

  function handleDragStart(x, y, state) {
    console.log(state);
    const newState = { pointerDown: true, PointerX: x, PointerY: y };
    setIsPointerDown(newState);
  }

  function handleOnDrag(x, y, state) {
    console.log("onDrag", x, y, state);
    if (mySocketId) {
      const data = { x: state.xy[0], y: state.xy[1] };

      sendCursorPositionData(data); // send to Socket.io

      // restartGame Logic
      if (gameEnded === true && data.x < 800 && data.y < 800) {
        sendInterceptRestartGameStart();
        // console.log("mousePosition", data, "intercept");
      }
      if ((gameEnded === true && data.x >= 800) || data.y >= 800) {
        sendInterceptRestartGameCancel();
        // console.log("mousePosition", data, "intercept ended");
      }
    }
  }

  function handleDragEnd() {
    api.start({ x: 0, y: 0 });
    const newState = { pointerDown: false, PointerX: 0, PointerY: 0 };
    setIsPointerDown(newState);
  }

  function userIsPressingMouseDown(user) {
    if (user.id) {
      cursors.current[`${user.id}`].firstChild.style.backgroundColor = `${user.clr}`;
    }
  }

  function userIsPressingMouseUp(id) {
    if (id) {
      cursors.current[`${id}`].firstChild.style.backgroundColor = "transparent";
    }
  }

  // Events
  // All Users Pressing Mouse Down

  function allUserPressingMouseDown(bln) {
    setTimerAnimation(true);

    if (bln === false) {
      setTimerAnimation(false);
    }
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
            {renderName(user.username, user.isMobile)}
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
