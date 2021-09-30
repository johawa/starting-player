import { Cloud } from "../asstest/Cloud";
import { Tree } from "../asstest/Tree";
import "../styles/GameBackground.css";

export function GameBackground() {
  return (
    <>
      <Cloud id={1}></Cloud>
      <Cloud id={2}></Cloud>
      <Tree></Tree>
      <svg id="ground"></svg>
    </>
  );
}
