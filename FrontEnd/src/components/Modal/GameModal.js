import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { customStyles, ModalState } from "./settings";
import { RenderCreateNewNamespace, RenderJoinNamespace, RenderMenu } from "./content";

Modal.setAppElement("#root");
const namespace = uuidv4();

export function GameModal({ open, closeModal, afterOpenModal, mode }) {
  function handleCreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);

    if (username) closeModal("create", namespace);
  }

  function handleRecreateGame(event) {
    event.preventDefault();
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);
    window.location.reload();

    if (username) closeModal("recreate", namespace);
  }

  function handleJoinGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
  
    localStorage.setItem("ps-username", username);

    if (username) closeModal("join", username);
  }

  function renderContent(mode) {
    switch (mode) {
      case ModalState.create:
        return (
          <RenderCreateNewNamespace
            handleCreateGame={handleCreateGame}
          ></RenderCreateNewNamespace>
        );

      case ModalState.join:
        return (
          <RenderJoinNamespace handleJoinGame={handleJoinGame}></RenderJoinNamespace>
        );

      case ModalState.menu:
        return (
          <RenderMenu
            closeModal={closeModal}
            handleRecreateGame={handleRecreateGame}
          ></RenderMenu>
        );

      default:
        console.error("Something went wrong rendering the Modal");
        return <div>Oops ! Something went wrong rendering the Modal</div>;
    }
  }

  return (
    <>
      <Modal
        isOpen={open}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Game Modal"
        shouldCloseOnOverlayClick={true}
      >
        <div>{renderContent(mode)}</div>
      </Modal>
    </>
  );
}
