import { toast } from "react-toastify";

export function RenderMenu({ dismissModal, handleRecreateGame }) {
  const copyLinkToClipboad = () => {
    var link = window.location.href;
    navigator.clipboard.writeText(link).then(
      function () {
        toast("📋 Invitation link copied to clipboard");
        dismissModal();
      },
      function (err) {
        toast.error("Something went wrong copying the invitation link");
      }
    );
  };

  return (
    <>
      <h1>Menu</h1>
      <div className="modal__menu__newGame">
        <h2>Create a new Game</h2>
        <br />
        <form className="formWrapper" onSubmit={handleRecreateGame}>
          <label htmlFor="username"></label>
          <input type="text" id="username" placeholder="Username" />
          <button className="default-button" type="submit">
            Create new Game
          </button>
          <p className="warn">All Current Users will be kicked out</p>
        </form>
      </div>
      <div className="modal__menu__copy">
        <button className="default-button" onClick={copyLinkToClipboad}>
          Copy Invitation Link
        </button>
      </div>
      <div className="modal__menu__dismiss">
        <button className="default-button" onClick={dismissModal}>
          Close Modal
        </button>
      </div>
    </>
  );
}
