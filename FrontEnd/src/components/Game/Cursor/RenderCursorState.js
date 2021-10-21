import { LooserCircle } from "./LooserCircle";
import { WinnerCircle } from "./WinnerCircle";

export function RenderCursorState({ gameEnded, winnerArray, timerAnimation, id }) {
  if (gameEnded === true && winnerArray) {
    const userWithPosition = winnerArray.filter((user) => user.id === id);
    const position = userWithPosition[0] ? userWithPosition[0].position + 1 : null;

    if (position && position === 1) {
      return (
        <>
          <div className="info_winner">🥇</div>
          <div className="cursor winner">
            <WinnerCircle></WinnerCircle>
          </div>
        </>
      );
    } else if (position && position !== 1) {
      return (
        <>
          <div className="info_looser">{position}</div>
          <div className="cursor looser">
            <LooserCircle finalRank={position}></LooserCircle>
          </div>
        </>
      );
    }
  } else if (gameEnded === false && !winnerArray) {
    return (
      <div className="cursor">
        <div className={timerAnimation ? "point_1 animationRev" : "point_1"}></div>
        <div className={timerAnimation ? "point_2 animation" : "point_2"}></div>
      </div>
    );
  }
}
