import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { customStyles, ModalState } from "./settings";
import { RenderCreateNewNamespace, RenderJoinNamespace, RenderMenu } from "./content";
import "../../styles/Modal.css";

Modal.setAppElement("#root");
const namespace = uuidv4();

export function GameModal({ open, closeModal, afterOpenModal, dismissModal, mode }) {
  function handleCreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);

    if (username) closeModal("create", namespace, null);
  }

  function handleRecreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);
    window.location.reload();

    if (username) closeModal("recreate", namespace, null);
  }

  function handleJoinGame(event) {
    event.preventDefault();
    const username = event.currentTarget.elements.username.value;

    localStorage.setItem("ps-username", username);
    if (username) closeModal("join", null, username);
  }

  function renderContent(mode) {
    switch (mode) {
      case ModalState.create:
        return <RenderCreateNewNamespace handleCreateGame={handleCreateGame}></RenderCreateNewNamespace>;

      case ModalState.join:
        return <RenderJoinNamespace handleJoinGame={handleJoinGame}></RenderJoinNamespace>;

      case ModalState.menu:
        return <RenderMenu dismissModal={dismissModal} handleRecreateGame={handleRecreateGame}></RenderMenu>;

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
        <div className="modal_content">{renderContent(mode)}</div>
      </Modal>
    </>
  );
}
