/* Credits to https://codesandbox.io/s/github/pmndrs/use-gesture/tree/main/demo/src/sandboxes/action-sheet?file=/src/App.jsx */

import React from "react";
import { useDrag } from "@use-gesture/react";
import { a, useSpring, config } from "@react-spring/web";
import "../../styles/MobileMenu.css";

const items = ["copy Invitation Link", "cancel"];
const height = items.length * 60 + 80;

export default function MobileMenu({ openIndicator }) {
  const [{ y }, api] = useSpring(() => ({ y: height }));

  const open = ({ canceled }) => {
    console.log("open");
    openIndicator(true);
    api.start({ y: 0, immediate: false, config: canceled ? config.wobbly : config.stiff });
  };

  const close = (velocity = 0) => {
    openIndicator(false);
    api.start({ y: height, immediate: false, config: { ...config.stiff, velocity } });
  };

  const bind = useDrag(
    ({ last, velocity: [, vy], direction: [, dy], movement: [, my], cancel, canceled }) => {
      if (my < -70) cancel();
      if (last) {
        my > height * 0.5 || (vy > 0.5 && dy > 0) ? close(vy) : open({ canceled });
      } else api.start({ y: my, immediate: true });
    },
    { from: () => [0, y.get()], filterTaps: true, bounds: { top: 0 }, rubberband: true }
  );

  const display = y.to((py) => (py < height ? "block" : "none"));

  function handClickOnItem(entry) {
    console.log(entry);
  }

  return (
    <>
      <div onClick={open} className="actionBtn" />
      <a.div className="sheet" {...bind()} style={{ display, bottom: `calc(-100vh + ${height - 100}px)`, y }}>
        {items.map((entry, i) => (
          <div key={entry} onClick={() => (i < items.length - 1 ? handClickOnItem(entry) : close())} children={entry} />
        ))}
      </a.div>
    </>
  );
}
