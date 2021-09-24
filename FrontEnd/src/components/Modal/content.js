export function RenderCreateNewRoom({ handleCreateGame }) {
  return (
    <>
      <h1>Create a Room</h1>
      <form className="formWrapper" onSubmit={handleCreateGame}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" />
        <br />
        <button type="submit">Create new Game</button>
      </form>
    </>
  );
}

export function RenderJoinRoom({ handleJoinGame }) {
  return (
    <>
      <h1>Join a Room</h1>
      <form className="formWrapper" onSubmit={handleJoinGame}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" />
        <br />
        <button type="submit">Join Game</button>
      </form>
    </>
  );
}

export function RenderMenu({ closeModal, handleRecreateGame }) {
  return (
    <>
      <h1>Menu</h1>
      <h3>Create a Room</h3>
      <p>All Current Users will be kicked out</p>
      <form className="formWrapper" onSubmit={handleRecreateGame}>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" />
        <br />
        <button type="submit">Create new Game</button>
      </form>

      <button onClick={closeModal}>Close Modal</button>
    </>
  );
}
