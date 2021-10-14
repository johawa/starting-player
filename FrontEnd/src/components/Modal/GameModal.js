import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { customStyles, ModalState } from "./settings";
import {  RenderJoinNamespace, RenderMenu } from "./content";
import "../../styles/Modal.css";

Modal.setAppElement("#root");
const namespace = uuidv4();

export function GameModal({ open, closeModal, afterOpenModal, dismissModal, mode }) {
  console.log("modalstate", mode);
  function handleRecreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    sessionStorage.setItem("ps-username", username);
    sessionStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);
    window.location.reload();

    if (username) closeModal("recreate", namespace, null);
  }

  function handleJoinGame(event) {
    event.preventDefault();
    const username = event.currentTarget.elements.username.value;

    sessionStorage.setItem("ps-username", username);
    if (username) closeModal("join", null, username);
  }

  function renderContent(mode) {
   /*  if (mode === null) return;

    switch (mode) {
      case ModalState.join:
        return <RenderJoinNamespace handleJoinGame={handleJoinGame}></RenderJoinNamespace>;

      case ModalState.menu:
        return <RenderMenu dismissModal={dismissModal} handleRecreateGame={handleRecreateGame}></RenderMenu>;

      default:
        console.error("Something went wrong rendering the Modal");
        return <div>Oops ! Something went wrong rendering the Modal</div>;
    } */

    return <RenderMenu dismissModal={dismissModal} handleRecreateGame={handleRecreateGame}></RenderMenu>;

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
        <>
          <div className="modal__menu__topbar"></div>
          <div className="modal_content">{renderContent(mode)}</div>
        </>
      </Modal>
    </>
  );
}
