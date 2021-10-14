import React from "react";
import "../styles/CreateGame.css";

export function JoinGame({ joinGame }) {
  function handleJoinGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    sessionStorage.setItem("ps-username", username);

    if (username) joinGame(username);
  }

  return (
    <>
      <div className="create__wrapper">
        <div className="create__contentWrapper">
          <div className="formWrapper">
            <h1>Join</h1>
            <form onSubmit={handleJoinGame}>
              <label htmlFor="username"></label>
              <input type="text" id="username" placeholder="Your Username" />

              <button className="default-button" type="submit">
                Join Game
              </button>
            </form>
          </div>
        </div>
      </div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
      <div class="circle"></div>
    </>
  );
}
