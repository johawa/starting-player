import { toast } from "react-toastify";

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const ESCAPE_KEYS = ["27", "Escape"];
const X_KEY = ["88", "x"];
const SLASH_KEY = ["111", "/"];

export function openModalHandler(key, cb) {
  if (ESCAPE_KEYS.includes(String(key)) || X_KEY.includes(String(key).toLowerCase())) {
    // Open Modal not on LandingPage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("namespace")) {
      return cb(true);
    }
  }

  if (SLASH_KEY.includes(String(key))) {
    // Open Modal not on LandingPage
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("namespace")) {
      var link = window.location.href;
      navigator.clipboard.writeText(link).then(
        function () {
          toast("📋 Invitation link copied to Clipboard");
        },
        function (err) {
          toast.error("Something went wrong copying the Invitation Link");
        }
      );
    }
  }
}
