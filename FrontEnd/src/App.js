import React, { useState, useEffect } from "react";
import Game from "./Pages/Game";
import { GameModal } from "./components/Modal/GameModal";
import { useEventListener } from "./utils/useEventListener";
import { CreateGame } from "./Pages/CreateGame";
import { JoinGame } from "./Pages/JoinGame";
import { openModalHandler } from "./utils/helpers";

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

  return (
    <>
      {renderContent()}
      {renderModal()}
      {namespace && username && <Game namespace={namespace} username={username}></Game>}
      {namespace && username && renderInfo()}
    </>
  );
}

export default App;
