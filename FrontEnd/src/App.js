import React, { useState, useEffect } from "react";
import Game from "./Game";
import { GameModal } from "./components/Modal/GameModal";
import { ModalState } from "./components/Modal/settings";
import { useEventListener } from "./utils/useEventListener";
import { Gamestart } from "./components/Gamestart";
import { toast } from "react-toastify";
import "./styles/Fonts.css";
import "react-toastify/dist/ReactToastify.css";

const ESCAPE_KEYS = ["27", "Escape"];
const X_KEY = ["88", "x"];
const SLASH_KEY = ["111", "/"];

function App() {
  const [renderModal, setRenderModal] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [namespace, setNamespace] = useState(null);
  const [username, setUsername] = useState(null);
  const [modalState, setModalState] = useState(ModalState.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const namespace = urlParams.get("namespace");
    const username = sessionStorage.getItem("ps-username");

    // username and namespace from browser Memory
    // console.log({ username }, { namespace });

    // refresh Page Case
    if (username && namespace) {
      setRenderModal(false);
      setUsername(username);
      setNamespace(namespace);
    }
    // new Case
    if (username && !namespace) {
      setUsername(username);
      setRenderModal(true);
      sessionStorage.removeItem("ps-namespace");
      sessionStorage.removeItem("ps-username");
    }
    // Join Case
    if (namespace && !username) {
      setUsername(null);
      setRenderModal(true);
      setNamespace(namespace);
      sessionStorage.setItem("ps-namespace", namespace);
      setModalState(ModalState.join);
    }
    // Create Case
    if (!namespace && !username) {
      setUsername(null);
      setRenderModal(true);
      setModalState(ModalState.create);
    }
  }, []);

  // Modal
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {}

  function closeModal(msg, namespace, username) {
    if (msg === "create") {
      setNamespace(namespace);
      setIsOpen(false);
    }
    if (msg === "join") {
      const namespace = sessionStorage.getItem("ps-namespace");
      setUsername(username);
      setNamespace(namespace);
      setIsOpen(false);
    }
    if (msg === "recreate") {
      setNamespace(namespace);
      setIsOpen(false);
    }
  }

  function createNewGame(namespace, username) {
    setUsername(username);
    setNamespace(namespace);
  }

  function renderContent() {
    if (renderModal) {
      switch (modalState) {
        case ModalState.create:
          return <Gamestart createNewGame={createNewGame}></Gamestart>;
        default:
          return (
            <GameModal
              mode={modalState}
              open={modalIsOpen}
              openModal={openModal}
              closeModal={closeModal}
              dismissModal={() => setRenderModal(false)}
              afterOpenModal={afterOpenModal}
            ></GameModal>
          );
      }
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

  // Event Listeners

  function handler({ key }) {
    if (ESCAPE_KEYS.includes(String(key)) || X_KEY.includes(String(key).toLowerCase())) {
      // Open Modal not on LandingPage
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("namespace")) {
        setRenderModal(true);
        setModalState(ModalState.menu);
        setIsOpen(true);
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
      {namespace && <Game namespace={namespace} username={username}></Game>}
      {namespace && renderInfo()}
    </>
  );
}

export default App;
