// TODO put this in Instance
class NamespaceTimer {
  timeleft = 1;
  downloadTimer;

  constructor(id) {
    this.id = id;
  }

  startTimer() {
    return new Promise((resolve) => {
      this.downloadTimer = setInterval(() => {
        if (this.timeleft <= 0) {
          resolve("done");
          clearInterval(this.downloadTimer);
        }
        console.log("count seconds", this.timeleft);
        this.timeleft -= 1;
      }, 1000);
    });
  }

  stopTimer() {
    clearInterval(this.downloadTimer);
    this.timeleft = 1;
  }
}

module.exports = {
  NamespaceTimer,
};
