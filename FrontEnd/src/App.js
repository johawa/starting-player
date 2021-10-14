import React, { useState, useEffect } from "react";
import Game from "./Pages/Game";
import { GameModal } from "./components/Modal/GameModal";
import { ModalState } from "./components/Modal/settings";
import { useEventListener } from "./utils/useEventListener";
import { CreateGame } from "./Pages/CreateGame";
import { JoinGame } from "./Pages/JoinGame";
import { toast } from "react-toastify";
import "./styles/Fonts.css";
import "react-toastify/dist/ReactToastify.css";

const ESCAPE_KEYS = ["27", "Escape"];
const X_KEY = ["88", "x"];
const SLASH_KEY = ["111", "/"];

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
    // new Case
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

  // Modalx
  function closeModal(msg, namespace, username) {
    console.log("closeModal", { msg }, { namespace }, { username });
    /* if (msg === "join") {
      const namespace = sessionStorage.getItem("ps-namespace");
      setUsername(username);
      setNamespace(namespace);
      setModalIsOpen(false);
      setMode(null);
    } */
    if (msg === "recreate") {
      setNamespace(namespace);
      setModalIsOpen(false);
    }
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
      <GameModal open={modalIsOpen} closeModal={closeModal} dismissModal={() => setModalIsOpen(false)}></GameModal>
    );
  }

  // Event Listeners
  function handler({ key }) {
    if (ESCAPE_KEYS.includes(String(key)) || X_KEY.includes(String(key).toLowerCase())) {
      // Open Modal not on LandingPage
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("namespace")) {
        setMode(ModalState.menu);
        setModalIsOpen(true);
        console.log("should openModal");
      }
    }

    if (SLASH_KEY.includes(String(key))) {
      // Open Modal not on LandingPage
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("namespace")) {
        var link = window.location.href;
        navigator.clipboard.writeText(link).then(
          function () {
            toast("📋 Invitation link copied to Clipboard");
          },
          function (err) {
            toast.error("Something went wrong copying the Invitation Link");
          }
        );
      }
    }
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
