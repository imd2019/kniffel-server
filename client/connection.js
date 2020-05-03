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
        this.gameCreated();
      } else {
        console.log("Game exists already.");
        this.gameNotCreated();
      }
    });
  }

  gameCreated() {}

  gameNotCreated() {}

  joinGame(name) {
    this.socket.emit("joinGame", name, function (game) {
      if (game != false) {
        console.log("Game " + game + "joined.");
        this.gameJoined();
      } else {
        console.log("Game does not exist or player has already joined.");
        this.gameNotJoined();
      }
    });
  }

  gameJoined() {}

  gameNotJoined() {}
}
