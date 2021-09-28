function determineIfAllUserArePressingMouseDown(users) {
  return ![...users].some((user) => user.isPressingMouseDown === false);
}

function determineIfAllUserAreInterceptingRestartCircle(users) {
  return ![...users].some(
    (user) => user.isInterceptiongRestartCircle === false
  );
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function determineWinner(activeUsers) {
  let winnerArray = [...activeUsers];
  shuffleArray(winnerArray);
  return winnerArray;
}

const colors = [
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
  determineWinner,
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
  User,
};
