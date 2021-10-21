import Confetti from "react-confetti";

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

export function RenderConfetti({ winnerArray, mySocketId }) {
  // Confetti is only rendered for the winner
  const userWithPosition = winnerArray.filter((user) => user.id === mySocketId);
  const isWinner = userWithPosition[0].position === 0;

  if (isWinner) {
    return (
      <Confetti
        width={window.document.documentElement.clientWidth}
        height={window.document.documentElement.clientHeight}
        numberOfPieces={100}
      />
    );
  }
  return null;
}
