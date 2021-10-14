import React from "react";
import "../../styles/BackgroundWrapper.css";

export function BackgroundWrapper(props) {
  return (
    <>
      <div className="app">
        <div className="create__contentWrapper">
          <div className="formWrapper">{props.children}</div>
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
