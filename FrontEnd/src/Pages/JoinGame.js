import React from "react";
import { BackgroundWrapper } from "../components/Wrapper/BackgroundWrapper";

export function JoinGame({ startPlaying }) {
  function handleJoinGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    const namespace = sessionStorage.getItem("ps-namespace");
    sessionStorage.setItem("ps-username", username);

    if (username && namespace) startPlaying(namespace, username);
  }

  return (
    <BackgroundWrapper>
      <h1>Player Start</h1>
      <h2>Join</h2>
      <form onSubmit={handleJoinGame}>
        <label htmlFor="username"></label>
        <input type="text" id="username" placeholder="Your Username" />

        <button className="default-button" type="submit">
          Join Game
        </button>
      </form>
    </BackgroundWrapper>
  );
}
