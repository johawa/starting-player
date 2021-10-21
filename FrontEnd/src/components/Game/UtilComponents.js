export function renderName(name, isMobile) {
  return (
    <p>
      {isMobile ? "📱" : null} {name}
    </p>
  );
}

export function RenderGameEnded({ playersInterceptingRestartCircle, activeUsersLength }) {
  return (
    <div className="gameEnded">
      <h3>Game Ended, come here to restart 🎉</h3>
      <p>
        {playersInterceptingRestartCircle ? playersInterceptingRestartCircle : 0}/{activeUsersLength}
      </p>
    </div>
  );
}
