function determineIfAllUserArePressingMouseDown(users) {
  return ![...users].some((user) => user.isPressingMouseDown === false);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function determineWinner(activeUsers) {
  let winnerArray = [...activeUsers.keys()];
  shuffleArray(winnerArray);
  return winnerArray;
}



module.exports = {
  determineWinner,
  determineIfAllUserArePressingMouseDown,
  determineWinner,
};
