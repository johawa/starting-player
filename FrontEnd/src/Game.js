import React, { useRef, useState, useEffect } from "react";
import { WinnerCircle } from "./components/WinnerCircle";
import { LooserCircle } from "./components/LooserCircle";
import { renderName } from "./components/RenderName";
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
} from "./utils/socket.helpers";
import { GameBackground } from "./components/GameBackground";
import "./styles/App.css";
import "./styles/Winner.css";
import "./styles/Looser.css";
import "./styles/GameEnded.css";
import "./styles/Font.css";

function Game({ namespace, username }) {
  const [timerAnimation, setTimerAnimation] = useState(false);

  const [gameEnded, setGameEnded] = useState(false);
  const [winnerArray, setWinnerArray] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);
  const [playersInterceptingRestartCircle, setPlayersInterceptingRestartCircle] = useState(null);

  const cursors = useRef([]);

  useEffect(() => {
    if (namespace) initiateSocket(namespace, username);

    subscribeToNewConnection((err, mySocketId) => {
      if (err) return;
      initiatetOwnUser(mySocketId);
    });

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

  useEffect(() => {
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
    syncInitCursorPositionOfOtherUsers(users);
  }



  // sync the positions of other players when you join a game
  function syncInitCursorPositionOfOtherUsers(users) {
    users.forEach((user) => {
      if (user.id !== mySocketId) {
        setCursorPosition(user);
      }
    });
  }  

  // Mouse Move
  function handleMouseMove(ev) {
    if (mySocketId) {
      const data = { x: ev.pageX, y: ev.pageY };

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
  function setCursorPosition(user) {
    const socketId = user.id;
    const radius = 80;

    if (socketId && cursors.current[`${socketId}`] && activeUsers) {
      cursors.current[`${socketId}`].style.top = `+${user.y - radius}px`;
      cursors.current[`${socketId}`].style.left = `+${user.x - radius}px`;
    }
  }

  // Mouse Down
  function handleMouseDown(ev) {
    sendUserMouseDown(); // send to Socket.io
  }

  function userIsPressingMouseDown(user) {
    if (user.id) {
      cursors.current[`${user.id}`].firstChild.style.backgroundColor = `${user.clr}`;
    }
  }

  // Mouse Up
  function handleMouseUp(ev) {
    sendUserMouseUp(); // send to Socket.io
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

  // Restart Games
  function userIsInterceptingRestartGame(users) {
    const amount = users.filter((user) => user.isInterceptiongRestartCircle).length;

    setPlayersInterceptingRestartCircle(amount);
  }

  function allUserInterceptRestartCircle() {
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
    if (activeUsers && mySocketId) {
      const ownUser = activeUsers.filter((user) => user.id === mySocketId);

      return (
        <div
          ref={(element) => {
            cursors.current[`${mySocketId}`] = element;
          }}
          className="cursor_wrapper"
          key={mySocketId}
        >
          {renderCursorState(mySocketId)}
          {renderName(`(${ownUser[0]?.username}) - It's you`)}
        </div>
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
      <div
        className="app"
        onMouseMove={(ev) => handleMouseMove(ev)}
        onMouseDown={(ev) => handleMouseDown(ev)}
        onMouseUp={(ev) => handleMouseUp(ev)}
      >
       {/*  <GameBackground></GameBackground>  */}
        {gameEnded && renderGameEnded()}
        {renderOwnPLayer()}
        {renderOtherPlayers()}
      </div>
    </>
  );
}

export default Game;
