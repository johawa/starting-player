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
import { isMobile } from "react-device-detect";

const useGesture = createUseGesture([dragAction]);

const log = console.log;

function GameMobile({ namespace, username }) {
  const [timerAnimation, setTimerAnimation] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winnerArray, setWinnerArray] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);
  const [playersInterceptingRestartCircle, setPlayersInterceptingRestartCircle] = useState(null);

  const [isPointerDown, setIsPointerDown] = useState(false);

  const [position, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 300 },
  }));

  const ref = React.useRef();
  const cursors = useRef([]);

  useGesture(
    {
      onDragStart: () => handleDragStart(),
      onDrag: ({ pinching, cancel, offset: [x, y], ...state }) => {
        if (pinching) return cancel();
        handleOnDrag(state, x, y);
      },
      onDragEnd: () => handleDragEnd(),
    },
    {
      target: ref,
      drag: {
        from: () => [position.x.get(), position.y.get()],
        bounds: { top: 0, left: 0, bottom: window.screen.height, right: window.screen.width },
      },
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

  useEffect(() => {
    subscribeToCursorPositionsData((err, cords) => {
      if (err) return;
      setCursorPosition(cords);
    });
    // winner
    subscribeToWinnerArray((err, data) => {
      if (err) return;
      processWinners(data);
    });
  }, [mySocketId]);

  useEffect(() => {
    // restart
    subscribeToUserInterceptRestartGameStart((err, id) => {
      if (err) return;
      userIsInterceptingRestartGame(id);
    });

    subscribeToUserInterceptRestartGameCancel((err, id) => {
      if (err) return;
      userIsInterceptingRestartGame(id);
    });

    subscribeToAllUserInterceptRestartCircle((err, id) => {
      if (err) return;
      allUserInterceptRestartCircle();
    });
  }, [playersInterceptingRestartCircle, gameEnded]);

  // init Functions
  function initiatetOwnUser(id) {
    setMySocketId(id);
  }

  function recordActiveUsers(users) {
    setActiveUsers(users);
  }

  function setCursorPosition(user) {
    const socketId = user.id;
    const radius = 40;

    if (socketId && cursors.current[`${socketId}`] && activeUsers && mySocketId) {
      if (user.id === mySocketId) {
        return;
      }
      cursors.current[`${socketId}`].style.top = `+${user.y}%`;
      cursors.current[`${socketId}`].style.left = `+${user.x}%`;
      // center cursor
      cursors.current[`${socketId}`].style.transform = `translate(-${radius}px, -${radius}px)`;
    }
  }

  function handleOnDrag(state, x, y) {
    const percentageX = (state.xy[0] / window.screen.width) * 100;
    const percentageY = (state.xy[1] / window.screen.height) * 100;
    let data = { x: percentageX, y: percentageY };

    const rect = cursors.current[`${mySocketId}`].getBoundingClientRect();

    if (x >= window.screen.width) {
      console.log("toBig");
      data = { x: 99, y };
      api.start({ x: window.screen.width - rect.width, y });
      return;
    }
    if (y >= window.screen.height) {
      console.log("toBig");
      data = { x, y: 99 };
      api.start({ x, y: window.screen.height - rect.height });
      return;
    }

    console.log("continue");
    api.start({ x, y });

    if (mySocketId) {
      sendCursorPositionData(data); // send to Socket.io
    }

    // restartGame Logic
    if (gameEnded === true && data.x < 30 && data.y <= 30) {
      sendInterceptRestartGameStart();
      // console.log("mousePosition", data, "intercept");
    }
    if ((gameEnded === true && data.x >= 30) || data.y >= 30) {
      sendInterceptRestartGameCancel();
      // console.log("mousePosition", data, "intercept ended");
    }
  }

  function handleDragStart(x, y, state) {
    if (!gameEnded) {
      setIsPointerDown(true);
      sendUserMouseDown(); // send to Socket.io
    }
  }

  function handleDragEnd() {
    if (!gameEnded) {
      setIsPointerDown(false);
      sendUserMouseUp();
    } // send to Socket.io
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

  function renderCursorState(id, mobileAndOwn) {
    if (gameEnded === true && winnerArray) {
      const userWithPosition = winnerArray.filter((user) => user.id === id);
      const position = userWithPosition[0] ? userWithPosition[0].position + 1 : null;

      if (position && position === 1) {
        return (
          <div>
            <div className="info_winner">🥇</div>
            <div className={`cursor winner`}>
              <WinnerCircle></WinnerCircle>
            </div>
          </div>
        );
      } else if (position && position !== 1) {
        return (
          <div>
            <div className="info_looser">{position}</div>
            <div className={`cursor looser`}>
              <LooserCircle finalRank={position}></LooserCircle>
            </div>
          </div>
        );
      }
    } else if (gameEnded === false && !winnerArray) {
      return (
        <div className={`cursor ${mobileAndOwn ? "ownPlayer" : null}`}>
          <div className={timerAnimation ? "point_1 animationRev" : "point_1"}></div>
          <div className={timerAnimation ? "point_2 animation" : "point_2"}></div>
        </div>
      );
    }
  }

  function userIsInterceptingRestartGame(users) {
    const amount = users.filter((user) => user.isInterceptiongRestartCircle).length;

    setPlayersInterceptingRestartCircle(amount);
  }

  function allUserPressingMouseDown(bln) {
    setTimerAnimation(true);

    if (bln === false) {
      setTimerAnimation(false);
    }
  }

  function allUserInterceptRestartCircle() {
    console.log("restart Game");

    // RestartGame
    setTimerAnimation(false);
    setGameEnded(false);
    setWinnerArray(null);
    setPlayersInterceptingRestartCircle(null);
  }

  function processWinners(data) {
    if (mySocketId) {
      const winnerArray = data.map((user, index) => {
        return { id: user.id, position: index };
      });
      setWinnerArray(winnerArray);
      setGameEnded(true);
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
    if (activeUsers && mySocketId) {
      const ownUser = activeUsers?.filter((user) => user.id === mySocketId);

      return (
        <animated.div
          className="cursor_wrapper"
          ref={(element) => {
            cursors.current[`${mySocketId}`] = element;
          }}
          key={mySocketId}
          style={{
            ...position,
          }}
          key={mySocketId}
        >
          {renderCursorState(mySocketId, true)}
          {renderName(`(${ownUser[0]?.username}📱) - It's you `)}
        </animated.div>
      );
    }
  }

  function renderGameEnded() {
    return (
      <div className="gameEnded">
        <h3>Game Ended, come here to restart 🎉</h3>
        <p>
          {playersInterceptingRestartCircle ? playersInterceptingRestartCircle : 0}/{activeUsers.length}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="app" ref={ref}>
        {gameEnded && renderGameEnded()}
        {renderOwnPLayer()}
        {renderOtherPlayers()}
      </div>
    </>
  );
}

export default GameMobile;
