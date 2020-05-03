/*
Connection to server.
(c)2020 Florian Beck and Leander Schmidt.
*/

export default class Connection {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.socket = this.connect();
  }

  connect() {
    return io.connect("localhost:3000/", {
      query: "name=" + this.username + "&pw=" + this.password,
    });
  }

  createGame(name, size) {
    let gameInfos = { name: name, size: size };
    this.socket.emit("createGame", gameInfos, function (game) {
      if (game != false) {
        console.log("Game " + game + "created.");
      } else {
        console.log("Game exists already.");
      }
    });
  }

  joinGame(name) {
    this.socket.emit("joinGame", name);
  }

  gameJoined(bool) {}
}
