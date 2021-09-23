import React, { useState } from "react";
import Game from "./Game";
import { ModalComponent } from "./components/ModalComponent";
import { initiateSocket } from "./utils/socket.helpers";

function App() {
  const [modalIsOpen, setIsOpen] = React.useState(true);
  const [roomId, setRoomId] = React.useState(null);

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
