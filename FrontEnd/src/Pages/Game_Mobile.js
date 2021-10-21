import React, { useRef, useState, useEffect } from "react";
import { renderName, RenderGameEnded, RenderConfetti } from "../components/Game/UtilComponents";
import { RenderCursorState } from "../components/Game/Cursor/RenderCursorState";
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

import MenuMobile from "../components/Modal/Menu_Mobile";
import Confetti from "react-confetti";
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

  const [isDragging, setIsDragging] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [position, api] = useSpring(() => ({
    x: 0,
    y: 0,
    config: { tension: 300 },
  }));

  const ref = React.useRef();
  const cursors = useRef([]);

  useGesture(
    {
      onDragStart: ({ event }) => handleDragStart(event),
      onDrag: ({ pinching, cancel, offset: [x, y], ...state }) => {
        /*   if (pinching) return cancel(); */
        handleOnDrag(state, x, y);
      },
      onDragEnd: () => handleDragEnd(),
    },
    {
      target: ref,
      drag: {
        from: () => [position.x.get(), position.y.get()],
        bounds: {
          top: 0,
          left: 0,
          bottom: window.document.documentElement.clientHeight,
          right: window.document.documentElement.clientWidth,
        },
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
    if (isMobileMenuOpen === true || !mySocketId) return;
    setIsDragging(true);

    const percentageX = (state.xy[0] / window.document.documentElement.clientWidth) * 100;
    const percentageY = (state.xy[1] / window.document.documentElement.clientHeight) * 100;
    let data = { x: percentageX, y: percentageY };

    const rect = cursors.current[`${mySocketId}`].firstChild.getBoundingClientRect();

    const rectPositionRightCorner = x + Math.floor(rect.width);
    const rectPositionBottom = y + Math.floor(rect.height);

    if (
      rectPositionRightCorner >= window.document.documentElement.clientWidth ||
      rectPositionBottom >= window.document.documentElement.clientHeight
    ) {
      console.log("toBig");
      return;
    }

    api.start({ x, y });

    if (mySocketId) {
      sendCursorPositionData(data); // send to Socket.io
    }

    const gameEndDimensions = window.document.documentElement.clientWidth * 0.45 - Math.floor(rect.width);

    // restartGame Logic
    if (gameEnded === true && x < gameEndDimensions && y <= gameEndDimensions) {
      sendInterceptRestartGameStart();
      // console.log("mousePosition", data, "intercept");
    }
    if ((gameEnded === true && x >= gameEndDimensions) || y >= gameEndDimensions) {
      sendInterceptRestartGameCancel();
      // console.log("mousePosition", data, "intercept ended");
    }
  }

  function handleDragStart(event) {
    if (isMobileMenuOpen === true) return;

    if (event.target.className === "actionBtn") return;

    if (!gameEnded) {
      setIsPointerDown(true);
      sendUserMouseDown(); /// send to Socket.io
    }
  }

  function handleDragEnd() {
    setIsDragging(false);
    if (isMobileMenuOpen === true) return;

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
            <RenderCursorState
              gameEnded={gameEnded}
              winnerArray={winnerArray}
              timerAnimation={timerAnimation}
              id={user.id}
            ></RenderCursorState>
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
          <RenderCursorState
            gameEnded={gameEnded}
            winnerArray={winnerArray}
            timerAnimation={timerAnimation}
            id={mySocketId}
          ></RenderCursorState>
          {renderName(`(${ownUser[0]?.username}📱) - It's you `)}
        </animated.div>
      );
    }
  }

  function handleMobileMenuOpenState(isOpen) {
    setMobileMenuOpen(isOpen);
  }

  function renderGameEnded() {
    return (
      <>
        <RenderConfetti winnerArray={winnerArray} mySocketId={mySocketId}></RenderConfetti>
        <RenderGameEnded
          playersInterceptingRestartCircle={playersInterceptingRestartCircle}
          activeUsersLength={activeUsers.length}
        ></RenderGameEnded>
      </>
    );
  }

  return (
    <>
      <div className="app" ref={ref}>
        {gameEnded && renderGameEnded()}
        <MenuMobile openIndicator={handleMobileMenuOpenState}></MenuMobile>
        {renderOwnPLayer()}
        {renderOtherPlayers()}
      </div>
    </>
  );
}

export default GameMobile;
