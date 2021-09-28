class User {
  constructor(id, room, username, x, y) {
    this.id = id;
    this.room = room;
    this.username = username;
    this.clr = colors.sort(() => 0.5 - Math.random()).pop();
    this.x = x ? x : 80;
    this.y = y ? y : 80;
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
}

module.exports = {
  User,
};
