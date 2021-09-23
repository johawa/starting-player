import React from "react";
import Modal from "react-modal";
import { v4 as uuidv4 } from "uuid";

export const ModalState = {
  create: "create",
  join: "join",
};

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

Modal.setAppElement("#root");
const roomId = uuidv4();

export function ModalComponent({ open, closeModal, afterOpenModal, mode }) {
  function handleSubmit(event) {
    event.preventDefault();
    const username = event.currentTarget.elements.username.value;

    console.log("event", { username });
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-roomId", roomId);
    window.history.pushState({}, null, `?roomId=${roomId}`);

    // if (username) initiateSocket(roomId);

    if (username) closeModal("success", roomId);
  }

  function renderCreateNewRoom() {
    return (
      <>
        <h1>Create a Room</h1>
        <form className="formWrapper" onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" />
          <br />
          <button type="submit">Create new Game</button>
        </form>
      </>
    );
  }

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
        <div>{mode === ModalState.create && renderCreateNewRoom()}</div>
      </Modal>
    </>
  );
}
