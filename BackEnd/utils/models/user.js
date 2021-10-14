// const { COLORS } = require("../constants/constants");

const COLORS = [
  "#F4DF4EFF",
  "#FC766AFF",
  "#5B84B1FF",
  "#5F4B8BFF",
  "#42EADDFF",
  "#CDB599FF",
  "#00A4CCFF",
  "#F95700FF",
  "#2C5F2D",
  "#00539CFF",
  "#B1624EFF",
];


class User {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.clr = COLORS.sort(() => 0.5 - Math.random()).pop();
    this.x = 80;
    this.y = 80;
    this.isPressingMouseDown = false;
    this.isInterceptiongRestartCircle = false;
  }

  setCords(x, y) {
    this.x = x;
    this.y = y;
  }

  setPressingMouseDown(bln) {
    this.isPressingMouseDown = bln;
  }

  setIsInterceptiongRestartCircle(bln) {
    this.isInterceptiongRestartCircle = bln;
  }
}

module.exports = {
  User,
};
