import React, { useState, useEffect } from "react";
import Game from "./Game";
import { ModalComponent, ModalState } from "./components/ModalComponent";

function App() {
  const [modalIsOpen, setIsOpen] = useState(true);
  const [roomId, setRoomId] = useState(null);
  const [modalState, setModalState] = useState(ModalState.create);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId");
    if (roomId) {
      setRoomId(roomId);
      localStorage.setItem("roomId", roomId);
      setModalState(ModalState.join);
    }
    if (!roomId) setModalState(ModalState.create);

    console.log("dev", roomId);
  }, []);

  // Modal
  function openModal() {
    setIsOpen(true);
  }

  function afterOpenModal() {}

  function closeModal(state, roomId) {
    console.log(state);
    if (state === "success") {
      setRoomId(roomId);
      setIsOpen(false);
    }
  }

  return (
    <>
      <ModalComponent
        mode={modalState}
        open={modalIsOpen}
        openModal={openModal}
        closeModal={closeModal}
        afterOpenModal={afterOpenModal}
      ></ModalComponent>

      {roomId && <Game roomId={roomId}></Game>}
    </>
  );
}

export default App;
