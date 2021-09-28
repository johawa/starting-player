// TODO put this in Instance
let timeleft = 1;
let downloadTimer;

function startTimer() {
  return new Promise((resolve) => {
    downloadTimer = setInterval(() => {
      if (timeleft <= 0) {
        resolve("done");
        clearInterval(downloadTimer);
      }
      console.log("count seconds", timeleft);
      timeleft -= 1;
    }, 1000);
  });
}

function stopTimer() {
  clearInterval(downloadTimer);
  timeleft = 1;
}

module.exports = {
  startTimer,
  stopTimer,
};
