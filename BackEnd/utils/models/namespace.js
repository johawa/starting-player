class Namespace {
  static #id = 0;
  #timeleft = 1;
  #downloadTimer;

  constructor(name, io) {
    Namespace.#id++;
    this.name = name;
    this.connection = io.of(`${name}`);
  }

  getNamespaceName() {
    return this.name;
  }

  get id() {
    return Namespace.#id;
  }

  async getActiveUsers() {
    const sockets = await this.connection.fetchSockets();
    return sockets.map((socket) => socket.data);
  }

  startTimer() {
    return new Promise((resolve) => {
      this.#downloadTimer = setInterval(() => {
        if (this.#timeleft <= 0) {
          resolve("done");
          clearInterval(this.#downloadTimer);
        }
        console.log("count seconds", this.#timeleft);
        this.#timeleft -= 1;
      }, 1000);
    });
  }

  stopTimer() {
    clearInterval(this.#downloadTimer);
    this.#timeleft = 1;
  }
}

module.exports = {
  Namespace,
};

