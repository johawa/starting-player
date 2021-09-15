module.exports.determineIfAllUserArePressingMouseDown =
  function determineIfAllUserArePressingMouseDown(users) {
    return ![...users].some((user) => user.isPressingMouseDown === false);
  };

module.exports.shuffleArray = function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
