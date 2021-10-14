import React from "react";
import { BackgroundWrapper } from "../components/Wrapper/BackgroundWrapper";
import { v4 as uuidv4 } from "uuid";

const namespace = uuidv4();

export function CreateGame({ startPlaying }) {
  function handleCreateGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    sessionStorage.setItem("ps-username", username);
    sessionStorage.setItem("ps-namespace", namespace);
    window.history.pushState({}, null, `?namespace=${namespace}`);

    if (username && namespace) startPlaying(namespace, username);
  }

  return (
    <BackgroundWrapper>
      <h1>Player Start</h1>
      <form onSubmit={handleCreateGame}>
        <label htmlFor="username"></label>
        <input type="text" id="username" placeholder="Your Username" />

        <button className="default-button" type="submit">
          create new game
        </button>
      </form>
    </BackgroundWrapper>
  );
}
