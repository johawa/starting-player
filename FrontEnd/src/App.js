import React, { useRef, useState, useEffect } from "react";
import { shuffleArray } from "./utils/helpers";
import {
  initiateSocket,
  subscribeToNewConnection,
  disconnectSocket,
  sendCursorPositionData,
  subscribeToCursorPositionsData,
  sendPlayerPressedMouse,
  subscribeToPlayerPressedMouse,
  sendPlayerMouseUp,
  subscribeToPlayerMouseUp,
  subscribeToActiveUsers,
  getSocket,
} from "./utils/socket.helpers";
import "./App.css";
import "./Winner.css";
import "./Looser.css";

const states = {
  winner: "winner",
  looser: "looser",
  default: "default",
};

const room = "A";
const players = ["Johannes", "maarit", "tatze"];
const playerName = "Johannes";

function App() {
  const [animate, setAnimate] = useState(false);
  const [state, setState] = useState(states.default);
  const [finalRank, setFinalRank] = useState(null);
  const [userPressingMouse, setUserPressingMouse] = useState({
    playerName: playerName,
    clr: "gray",
  });

  const [activeUsers, setActiveUsers] = useState(null);

  const [mySocketId, setMySocketId] = useState(null);

  const cursor = useRef(null);

  useEffect(() => {
    if (room) initiateSocket(room);

    subscribeToNewConnection((err, mySocketId) => {
      if (err) return;
      initiatetOwnUser(mySocketId);
    });

    subscribeToCursorPositionsData((err, cords) => {
      if (err) return;
      setCursorPosition(cords);
    });

    subscribeToPlayerPressedMouse((err, player) => {
      if (err) return;
      userIsPressingMouseDown(player);
    });

    subscribeToPlayerMouseUp((err, player) => {
      if (err) return;
      userIsMouseUp(player);
    });

    subscribeToActiveUsers((err, users) => {
      if (err) return;
      recordActiveUsers(users);
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  function initiatetOwnUser(id) {
    setMySocketId(id);
  }

  function handleMouseMove(ev) {
    const cords = { x: ev.pageX, y: ev.pageY };
    setCursorPosition(cords);

    sendCursorPositionData(cords, room); // send to Socket.io
  }

  function setCursorPosition(cords) {
    cursor.current.style.top = `+${cords.y}px`;
    cursor.current.style.left = `+${cords.x}px`;
  }

  function handleMouseDown(ev) {
    sendPlayerPressedMouse(playerName, room); // send to Socket.io

    /*     let timeleft = 2;
    var downloadTimer = setInterval(function () {
      if (timeleft <= 0) {
        determineWinner(playerName);
        clearInterval(downloadTimer);
      }
      console.log("count seconds", timeleft);
      timeleft -= 1;
    }, 1000);

    setAnimate(true); */
  }

  function recordActiveUsers(users) {
    console.log("recordActiveUsers", users);
    setActiveUsers(users);
  }

  function userIsPressingMouseDown(player) {
    setUserPressingMouse({ player: player, clr: "red" });
  }

  function userIsMouseUp(player) {
    setUserPressingMouse({ player: player, clr: "gray" });
  }

  function handleMouseUp(ev) {
    sendPlayerMouseUp(playerName, room); // send to Socket.io
  }

  function determineWinner(playerName) {
    shuffleArray(players);
    const position = players.indexOf(playerName);
    const finalRank = position + 1;
    setFinalRank(finalRank);
    if (finalRank === 1) {
      setState(states.winner);
    } else {
      setState(states.looser);
    }

    console.log("finalArray", position, players);
  }

  function renderCursor() {
    switch (state) {
      case states.winner:
        return (
          <div
            className="cursor winner"
            style={{ backgroundColor: userPressingMouse.clr }}
          >
            <WinnerCircle></WinnerCircle>
          </div>
        );
      case states.looser:
        return (
          <div
            className="cursor looser"
            style={{ backgroundColor: userPressingMouse.clr }}
          >
            <LooserCircle finalRank={finalRank}></LooserCircle>
          </div>
        );
      default:
        return (
          <div
            className="cursor"
            style={{ backgroundColor: userPressingMouse.clr }}
          >
            <div className={animate ? "point_1 animationRev" : "point_1"}></div>
            <div className={animate ? "point_2 animation" : "point_2"}></div>
          </div>
        );
    }
  }

  function renderName(id) {
    return <div>{id}</div>;
  }

  function renderOtherPlayers() {
    if (activeUsers && mySocketId) {
      const otherUsers = activeUsers.filter((user) => user.id !== mySocketId);

      return otherUsers.map((user) => {
        return (
          <div className="cursor_wrapper" key={user.id}>
            {renderCursor()}
            {renderName(user.id)}
          </div>
        );
      });
    }
  }

  function renderOwnPLayer() {
    if (mySocketId) {
      return (
        <div ref={cursor} className="cursor_wrapper">
          {renderCursor()}
          {renderName(mySocketId)}
        </div>
      );
    }
  }

  return (
    <div
      className="app"
      onMouseMove={(ev) => handleMouseMove(ev)}
      onMouseDown={(ev) => handleMouseDown(ev)}
      onMouseUp={(ev) => handleMouseUp(ev)}
    >
      {renderOwnPLayer()}
      {renderOtherPlayers()}
    </div>
  );
}

function WinnerCircle() {
  return (
    <>
      <div className="point_winner" style={{ "--i": 1 }}></div>
      <div className="point_winner" style={{ "--i": 2 }}></div>
      <div className="point_winner" style={{ "--i": 3 }}></div>
      <div className="point_winner" style={{ "--i": 4 }}></div>
      <div className="point_winner" style={{ "--i": 5 }}></div>
      <div className="point_winner" style={{ "--i": 6 }}></div>
    </>
  );
}

function LooserCircle({ finalRank }) {
  return (
    <>
      <div className="point_looser" style={{ "--i": 1 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 2 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 3 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 4 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 5 }}>
        {finalRank}
      </div>
      <div className="point_looser" style={{ "--i": 6 }}>
        {finalRank}
      </div>
    </>
  );
}

export default App;
