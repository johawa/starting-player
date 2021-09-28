const { colors } = require("../constants/colors");

class User {
  constructor(id, username) {
    this.id = id;
    this.username = username;
    this.clr = colors.sort(() => 0.5 - Math.random()).pop();
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
