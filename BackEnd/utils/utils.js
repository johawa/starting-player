function determineIfAllUserArePressingMouseDown(users) {
  return ![...users].some((user) => user.isPressingMouseDown === false);
}

function determineIfAllUserAreInterceptingRestartCircle(users) {
  return ![...users].some((user) => user.isInterceptiongRestartCircle === false);
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

function checkForDuplicateName(username, activeUsers) {
  const check = activeUsers?.filter((user) => user.username === username);
  console.log("check", check.length, activeUsers.length);
  if (check.length >= 1 && activeUsers.length > 1) {
    console.log("dublicate");
    return `${username}_${check.length + 1}`;
  }
  return username;
}

module.exports = {
  determineWinner,
  determineIfAllUserArePressingMouseDown,
  determineIfAllUserAreInterceptingRestartCircle,
  determineWinner,
  checkForDuplicateName,
};
