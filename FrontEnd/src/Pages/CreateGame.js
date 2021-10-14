import React from "react";
import { BackgroundWrapper, BackgroundWrapper_Mobile } from "../components/Wrapper/BackgroundWrapper";
import { v4 as uuidv4 } from "uuid";
import { BrowserView, MobileView, isBrowser, isMobile } from "react-device-detect";

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

  function renderContent() {
    return (
      <>
        <h1>Player Start</h1>
        <form onSubmit={handleCreateGame}>
          <label htmlFor="username"></label>
          <input type="text" id="username" placeholder="Your Username" />
          <button className="default-button" type="submit">
            create new game
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
