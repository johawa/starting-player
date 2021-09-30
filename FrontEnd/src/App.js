import React, { useState, useEffect } from "react";
import Game from "./Game";
import { GameModal } from "./components/Modal/GameModal";
import { ModalState } from "./components/Modal/settings";
import { useEventListener } from "./utils/useEventListener";
import { Gamestart } from "./components/Gamestart";
import { render } from "@testing-library/react";

const ESCAPE_KEYS = ["27", "Escape"];
const X_KEY = ["88", "x"];

function App() {
  const [renderModal, setRenderModal] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [namespace, setNamespace] = useState(null);
  const [username, setusername] = useState(null);
  const [modalState, setModalState] = useState(ModalState.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const namespace = urlParams.get("namespace");

    const username = localStorage.getItem("ps-username");
    console.log({ username }, { namespace });

    // refresh Page Case
    if (username && namespace) {
      setRenderModal(false);
      setusername(username);
      setNamespace(namespace);
    }
    // new Case
    if (username && !namespace) {
      setusername(username);
      setRenderModal(true);
      localStorage.removeItem("ps-namespace");
      localStorage.removeItem("ps-username");
    }
    // Join Case
    if (namespace && !username) {
      setusername(null);
      setRenderModal(true);
      setNamespace(namespace);
      localStorage.setItem("ps-namespace", namespace);
      setModalState(ModalState.join);
    }
    // Create Case
    if (!namespace && !username) {
      setusername(null);
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
      const namespace = localStorage.getItem("ps-namespace");
      setusername(username);
      setNamespace(namespace);
      setIsOpen(false);
    }
    if (msg === "recreate") {
      setNamespace(namespace);
      setIsOpen(false);
    }
  }

  function renderContent() {
    console.log({ renderModal }, { modalState });
    if (renderModal) {
      switch (modalState) {
        case ModalState.create:
          return <Gamestart closeModal={closeModal}></Gamestart>;
        default:
          return (
            <GameModal
              mode={modalState}
              open={modalIsOpen}
              openModal={openModal}
              closeModal={closeModal}
              afterOpenModal={afterOpenModal}
            ></GameModal>
          );
      }
    }
  }

  // Event Listeners

  function handler({ key }) {
    if (ESCAPE_KEYS.includes(String(key)) || X_KEY.includes(String(key).toLowerCase())) {
      setRenderModal(true);
      setModalState(ModalState.menu);
      setIsOpen(true);
    }
  }

  useEventListener("keydown", handler);

  return (
    <>
      {renderContent()}
      {namespace && username && <Game namespace={namespace} username={username}></Game>}
      <h3 className="menu_info_text">Press [X] or [ESC] to open Menu</h3>
    </>
  );
}

export default App;
