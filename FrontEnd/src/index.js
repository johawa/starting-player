import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ToastContainer } from "react-toastify";
import "./styles/Font.css";
import "react-toastify/dist/ReactToastify.css";
import { isMobile } from "react-device-detect";

ReactDOM.render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position={isMobile ? "top-center" : "bottom-right"}
      autoClose={isMobile ? 1000 : 4000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
