import React from "react";
import { BackgroundWrapper, BackgroundWrapper_Mobile } from "../components/Wrapper/BackgroundWrapper";
import { isBrowser } from "react-device-detect";

export function JoinGame({ startPlaying }) {
  function handleJoinGame(event) {
    event.preventDefault();

    const username = event.currentTarget.elements.username.value;
    const namespace = sessionStorage.getItem("ps-namespace");
    sessionStorage.setItem("ps-username", username);

    if (username && namespace) startPlaying(namespace, username);
  }

  function renderContent() {
    return (
      <>
        <h1>Player Start</h1>
        <h2>Join</h2>
        <br></br>
        <form onSubmit={handleJoinGame}>
          <label htmlFor="username"></label>
          <input type="text" id="username" placeholder="Your Username" />
          <button className="default-button" type="submit">
            Join Game
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      {isBrowser ? (
        <BackgroundWrapper>{renderContent()}</BackgroundWrapper>
      ) : (
        <BackgroundWrapper_Mobile>{renderContent()}</BackgroundWrapper_Mobile>
      )}
    </>
  );
}
