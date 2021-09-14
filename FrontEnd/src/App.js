import React, { useRef, useState, useEffect } from "react";
import { shuffleArray } from "./utils/helpers";
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
  getWinnerArray,
  subscribeToWinnerArray,
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

function App() {
  const [animate, setAnimate] = useState(false);
  const [state, setState] = useState(states.default);
  const [finalRank, setFinalRank] = useState(null);

  const [activeUsers, setActiveUsers] = useState([]);
  const [mySocketId, setMySocketId] = useState(null);

  const cursors = useRef([]);

  useEffect(() => {
    if (room) initiateSocket(room);

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
    // dev
    subscribeToWinnerArray((err, data) => {
      if (err) return;
      processWinners(data);
    });
  }, [mySocketId]);

  // init Functions
  function initiatetOwnUser(id) {
    setMySocketId(id);
  }

  function recordActiveUsers(users) {
    setActiveUsers(users);
  }

  // Mouse Move
  function handleMouseMove(ev) {
    if (mySocketId) {
      const data = { x: ev.pageX, y: ev.pageY, socketId: mySocketId }; // TODO Refactoring
      sendCursorPositionData(data, room); // send to Socket.io
    }
  }
  function setCursorPosition(data) {
    const socketId = data.cords.socketId;
    if (socketId && cursors) {
      cursors.current[`${socketId}`].style.top = `+${data.cords.y}px`;
      cursors.current[`${socketId}`].style.left = `+${data.cords.x}px`;
    }
  }

  // Mouse Down
  function handleMouseDown(ev) {
    if (mySocketId) {
      sendUserMouseDown(mySocketId, room); // send to Socket.io
    }
  }
  function userIsPressingMouseDown(id) {
    if (id) {
      cursors.current[`${id}`].firstChild.style.backgroundColor = "red";
    }
  }

  // Mouse Up
  function handleMouseUp(ev) {
    if (mySocketId) {
      sendUserMouseUp(mySocketId, room); // send to Socket.io
    }
  }
  function userIsPressingMouseUp(id) {
    if (id) {
      cursors.current[`${id}`].firstChild.style.backgroundColor = "gray";
    }
  }

  // Events
  // All Users Pressing Mouse Down

  function allUserPressingMouseDown(bln) {
    setAnimate(true);

    // TODO remove and add listener from BE, winner array will come from the BE
    determineWinners();

    if (bln === false) {
      setAnimate(false);
    }
  }

  // Determine Winners
  function determineWinners() {
    getWinnerArray(room);
  }

  function processWinners(data) {
    console.log("processWinners", data, mySocketId);
    if (mySocketId) {
      const position = data.map((user) => user.id).indexOf(mySocketId) + 1;
      console.log("processWinners", position);
      setFinalRank(position);
      
      if (position === 1) {
        setState(states.winner);
      } else {
        setState(states.looser);
      }
    }
  }

  function renderCursorState() {
    switch (state) {
      case states.winner:
        return (
          <div className="cursor winner">
            <WinnerCircle></WinnerCircle>
          </div>
        );
      case states.looser:
        return (
          <div className="cursor looser">
            <LooserCircle finalRank={finalRank}></LooserCircle>
          </div>
        );
      default:
        return (
          <div className="cursor">
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
          <div
            ref={(element) => {
              cursors.current[`${user.id}`] = element;
            }}
            className="cursor_wrapper"
            key={user.id}
          >
            {renderCursorState()}
            {renderName(user.id)}
          </div>
        );
      });
    }
  }

  function renderOwnPLayer() {
    if (mySocketId) {
      return (
        <div
          ref={(element) => {
            cursors.current[`${mySocketId}`] = element;
          }}
          className="cursor_wrapper"
          key={mySocketId}
        >
          {renderCursorState()}
          {renderName(mySocketId)}
        </div>
      );
    }
  }

  return (
    <>
      <div style={{ height: "200px" }}>
        <button onClick={(ev) => determineWinners(ev)}>determineWinners</button>
      </div>
      <div
        className="app"
        onMouseMove={(ev) => handleMouseMove(ev)}
        onMouseDown={(ev) => handleMouseDown(ev)}
        onMouseUp={(ev) => handleMouseUp(ev)}
      >
        <br />
        {renderOwnPLayer()}
        {renderOtherPlayers()}
      </div>
    </>
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
