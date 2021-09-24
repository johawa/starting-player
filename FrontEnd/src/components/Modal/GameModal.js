import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { customStyles, ModalState } from "./settings";
import { RenderCreateNewRoom, RenderJoinRoom, RenderMenu } from "./content";

Modal.setAppElement("#root");
const roomId = uuidv4();

export function GameModal({ open, closeModal, afterOpenModal, mode }) {
  function handleCreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-roomId", roomId);
    window.history.pushState({}, null, `?roomId=${roomId}`);

    if (username) closeModal("create", roomId);
  }

  function handleJoinGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);

    if (username) closeModal("join", null);
  }

  function renderContent(mode) {
    switch (mode) {
      case ModalState.create:
        return (
          <RenderCreateNewRoom
            handleCreateGame={handleCreateGame}
          ></RenderCreateNewRoom>
        );

      case ModalState.join:
        return (
          <RenderJoinRoom handleJoinGame={handleJoinGame}></RenderJoinRoom>
        );

      case ModalState.menu:
        return <RenderMenu></RenderMenu>;

      default:
        console.error("Something went wrong rendering the Modal");
        return <div>Oops ! Something went wrong rendering the Modal</div>;
    }
  }

  console.log(mode);
  return (
    <>
      <Modal
        isOpen={open}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
        shouldCloseOnOverlayClick={false}
      >
        <div>{renderContent(mode)}</div>
      </Modal>
    </>
  );
}
