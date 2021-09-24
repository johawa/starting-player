import React, { useState, useEffect } from "react";
import Game from "./Game";
import { GameModal } from "./components/Modal/GameModal";
import { ModalState } from "./components/Modal/settings";

function App() {
  const [renderModal, setRenderModal] = useState(false);
  const [modalIsOpen, setIsOpen] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [modalState, setModalState] = useState(ModalState.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId");

    const username = localStorage.getItem("ps-username");
    console.log(username, roomId);

    // refresh Page Case
    if (username && roomId) {
      setRenderModal(false);
      setRoomId(roomId);
    }
    // new Case
    if (username && !roomId) {
      setRenderModal(true);
      localStorage.removeItem("ps-roomId");
      localStorage.removeItem("ps-username");
    }
    // Join Case
    if (roomId && !username) {
      setRenderModal(true);
      setRoomId(roomId);
      localStorage.setItem("ps-roomId", roomId);
      setModalState(ModalState.join);
    }
    // Create Case
    if (!roomId && !username) {
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
  }

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

      {roomId && <Game roomId={roomId}></Game>}
    </>
  );
}

export default App;
