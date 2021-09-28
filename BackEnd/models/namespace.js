// TODO put this in Instance
class Namespace {
  timeleft = 1;
  downloadTimer;

  constructor(name, io) {
    this.name = name;
    this.connection = io.of(`${name}`);
  }

  getNamespaceName() {
    return this.name;
  }

  async getActiveUsers() {
    const sockets = await this.connection.fetchSockets();
    return sockets.map((socket) => socket.data);
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
  Namespace,
};
