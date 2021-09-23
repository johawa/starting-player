import React from "react";
import Modal from "react-modal";
import { initiateSocket } from "../utils/socket.helpers";

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

export function ModalComponent({ open, closeModal, afterOpenModal }) {
  function handleSubmit(event) {
    event.preventDefault();
    const username = event.currentTarget.elements.username.value;
    const roomname = "A";
    console.log("event", { roomname }, { username });
    localStorage.setItem("ps-username", username);

    if (roomname) initiateSocket(roomname);
    // closeModal();
  }

  function renderCreateNewRoom() {
    return (
      <>
        <h1>Create a Room</h1>
        <form className="formWrapper" onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" />
          <br />
          <button type="submit">Submit</button>
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
        <div>{renderCreateNewRoom()}</div>
      </Modal>
    </>
  );
}
