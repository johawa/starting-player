import React, { useState, useEffect } from "react";
import Game from "./Game";
import { GameModal } from "./components/Modal/GameModal";
import { ModalState } from "./components/Modal/settings";
import { useEventListener } from "./utils/useEventListener";

const ESCAPE_KEYS = ["27", "Escape"];
const X_KEY = ["88", "x"];

function App() {
  const [renderModal, setRenderModal] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [modalState, setModalState] = useState(ModalState.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId");

    const username = localStorage.getItem("ps-username");
    console.log({username}, {roomId});

    // refresh Page Case
    if (username && roomId) {
      setRenderModal(false);
      setUserName(username);
      setRoomId(roomId);
    }
    // new Case
    if (username && !roomId) {
      setUserName(username);
      setRenderModal(true);
      localStorage.removeItem("ps-roomId");
      localStorage.removeItem("ps-username");
    }
    // Join Case
    if (roomId && !username) {
      setUserName(null);
      setRenderModal(true);
      setRoomId(roomId);
      localStorage.setItem("ps-roomId", roomId);
      setModalState(ModalState.join);
    }
    // Create Case
    if (!roomId && !username) {
      setUserName(null);
      setRenderModal(true);
      setModalState(ModalState.create);
    }

    console.log("dev", roomId);
  }, []);

  // Modal
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {}

  function closeModal(msg, roomId) {
    if (msg === "create") {
      setRoomId(roomId);
      setIsOpen(false);
    }
    if (msg === "join") {
      const roomId = localStorage.getItem("ps-roomId");
      setRoomId(roomId);
      setIsOpen(false);
    }
    if (msg === "recreate") {
      setRoomId(roomId);
      setIsOpen(false);
    }
  }

  // Event Listeners

  function handler({ key }) {
    if (
      ESCAPE_KEYS.includes(String(key)) ||
      X_KEY.includes(String(key).toLowerCase())
    ) {
      setRenderModal(true);
      setModalState(ModalState.menu);
      setIsOpen(true);
    }
  }

  useEventListener("keydown", handler);

  return (
    <>
      {renderModal && (
        <GameModal
          mode={modalState}
          open={modalIsOpen}
          openModal={openModal}
          closeModal={closeModal}
          afterOpenModal={afterOpenModal}
        ></GameModal>
      )}

      {roomId && <Game roomId={roomId} userName={userName}></Game>}
      <h3 className="menu_info_text">Press [X] or [ESC] to open Menu</h3>
    </>
  );
}

export default App;
