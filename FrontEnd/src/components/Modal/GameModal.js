import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";
import { RenderMenu } from "./content";
import "../../styles/Modal.css";

Modal.setAppElement("#root");
const namespace = uuidv4();

export const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

export function GameModal({ open, createNewGameAndCloseOld, dismissModal }) {
  function handleRecreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    sessionStorage.setItem("ps-username", username);
    sessionStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);
    window.location.reload();

    if (username) createNewGameAndCloseOld("recreate", namespace, null);
  }

  function renderContent() {
    return <RenderMenu dismissModal={dismissModal} handleRecreateGame={handleRecreateGame}></RenderMenu>;
  }

  return (
    <>
      <Modal isOpen={open} style={customStyles} contentLabel="Game Modal" shouldCloseOnOverlayClick={true}>
        <>
          <div className="modal__menu__topbar"></div>
          <div className="modal_content">{renderContent()}</div>
        </>
      </Modal>
    </>
  );
}
