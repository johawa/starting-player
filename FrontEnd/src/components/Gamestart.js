import React from "react";
import circles from "../asstest/circles.png";
import { v4 as uuidv4 } from "uuid";
import "../styles/Gamestart.css";

const namespace = uuidv4();

export function Gamestart({ createNewGame }) {

  function handleCreateGame(event) {
    event.preventDefault();
    
    const username = event.currentTarget.elements.username.value;
    localStorage.setItem("ps-username", username);
    localStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);
    console.log("create", username, namespace);

    if (username) createNewGame(namespace, username);
  }

  return (
    <>
      <div className="create__wrapper">
        <div className="create__imageWrapper">
          <img className="create__image" src={circles} alt="rotating_circles"></img>
        </div>
        <div className="create__contentWrapper">
          <div className="formWrapper">
            <h1>Player Start</h1>
            <form onSubmit={handleCreateGame}>
              <label htmlFor="username"></label>
              <input type="text" id="username" placeholder="Your Username" />

              <button type="submit">create new game</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
