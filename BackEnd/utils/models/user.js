const { COLORS } = require("../constants/constants");

class User {
  constructor(id, username, isMobile) {
    this.id = id;
    this.username = username;
    /*  this.clr = COLORS.sort(() => 0.5 - Math.random()).pop(); */
    this.clr = "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
    this.isMobile = isMobile;
    this.x = isMobile ? Math.floor(Math.random() * 80) : 80; // Mobile Users init Position is set randomly between x/y: 0-80%
    this.y = isMobile ? Math.floor(Math.random() * 80) : 80;
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
