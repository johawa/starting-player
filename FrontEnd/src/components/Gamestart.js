import React from "react";
import circles from "../asstest/circles.png";
import { v4 as uuidv4 } from "uuid";
import "../styles/Gamestart.css";

const namespace = uuidv4();

export function Gamestart({ closeModal }) {
  function handleCreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);

    if (username) closeModal("create", namespace, null);
  }

  return (
    <>
      <div className="create__wrapper">
        <div className="create__imageWrapper">
          <img className="create__image" src={circles} alt="rotating_circles"></img>
        </div>
        <div className="create__contentWrapper">
          <div className="formWrapper">
            <h1>Create a Namespace</h1>
            <form onSubmit={handleCreateGame}>
              <label htmlFor="username">username:</label>
              <input type="text" id="username" placeholder="Username" />
              <br />
              <button type="submit">Create new Game</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
