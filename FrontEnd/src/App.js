import React, { useState, useEffect } from "react";
import Game from "./Pages/Game";
import { GameModal } from "./components/Modal/GameModal";
import { useEventListener } from "./utils/useEventListener";
import { CreateGame } from "./Pages/CreateGame";
import { JoinGame } from "./Pages/JoinGame";
import { openModalHandler } from "./utils/helpers";
import { isBrowser } from "react-device-detect";
import { useSpring, animated } from "@react-spring/web";
import { createUseGesture, dragAction } from "@use-gesture/react";


import Game_mobile from "./Pages/Game_Mobile";

const useGesture = createUseGesture([dragAction]);

const MODE = {
  create: "create",
  join: "join",
  playing: "playing",
};

function App() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [namespace, setNamespace] = useState(null);
  const [username, setUsername] = useState(null);

  const [mode, setMode] = useState(MODE.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const namespace = urlParams.get("namespace");
    const username = sessionStorage.getItem("ps-username");
    console.log({ username }, { namespace });

    // refresh Page Case
    if (username && namespace) {
      setMode(MODE.playing);
      setUsername(username);
      setNamespace(namespace);
    }
    // TODO
    // new Case / recreate

    /*  if (username && !namespace) {
      setGameIsCreated(false);

      setUsername(username);
      sessionStorage.removeItem("ps-namespace");
      sessionStorage.removeItem("ps-username");
    } */
    // Join Case
    if (!username && namespace) {
      setMode(MODE.join);
      setUsername(null);
      setNamespace(namespace);
      sessionStorage.setItem("ps-namespace", namespace);
    }
    // Create Case
    if (!username && !namespace) {
      setMode(MODE.create);
      setUsername(null);
    }

    return () => {
      console.log("unmount");
      setMode(MODE.create);
      setUsername(null);
    };
  }, []);

  // Modal
  function createNewGameAndCloseOld(namespace) {
    // TODO
    setNamespace(namespace);
    setModalIsOpen(false);
  }

  function startPlaying(namespace, username) {
    setUsername(username);
    setNamespace(namespace);
    setMode(MODE.playing);
  }

  function renderContent() {
    switch (mode) {
      case MODE.create:
        return <CreateGame startPlaying={startPlaying}></CreateGame>;

      case MODE.join:
        return <JoinGame startPlaying={startPlaying}></JoinGame>;

      case MODE.playing:
        return null;

      default:
        console.error("Something went wrong in [renderContent] Function");
    }
  }

  function renderInfo() {
    return (
      <div className="menu_info_container">
        <h3 className="menu_info_text">Press [X] or [ESC] to open Menu</h3>
        <p className="menu_info_text">Press [/] to copy invitation link</p>
      </div>
    );
  }

  function renderModal() {
    return (
      <GameModal
        open={modalIsOpen}
        createNewGameAndCloseOld={createNewGameAndCloseOld}
        dismissModal={() => setModalIsOpen(false)}
      ></GameModal>
    );
  }

  // Event Listeners
  function handler({ key }) {
    const callback = (bln) => {
      if (bln === true) {
        setMode(MODE.menu);
        setModalIsOpen(true);
      }
    };

    openModalHandler(key, callback);
  }

  useEventListener("keydown", handler);

  useEffect(() => {
    const handler = (e) => e.preventDefault();
    document.addEventListener("gesturestart", handler);
    document.addEventListener("gesturechange", handler);
    return () => {
      document.removeEventListener("gesturestart", handler);
      document.removeEventListener("gesturechange", handler);
    };
  }, []);

  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
  }));
  const ref = React.useRef(null);

  useGesture(
    {
      // onHover: ({ active, event }) => console.log('hover', event, active),
      onMove: ({ event }) => console.log("move", event),
      onDrag: ({ pinching, cancel, offset: [x, y], ...rest }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
    },
    {
      target: ref,
      drag: { from: () => [style.x.get(), style.y.get()] },
    }
  );

  return (
    <>
      <animated.div style={style} ref={ref} className="test" />
      {renderContent()}
      {renderModal()}
      {namespace && username && <Game_mobile namespace={namespace} username={username}></Game_mobile>}
      {namespace && username && !modalIsOpen && isBrowser && renderInfo()}
    </>
  );
}

export default App;
