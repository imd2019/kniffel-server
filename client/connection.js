/*
Connection to server.
(c)2020 Florian Beck and Leander Schmidt.
*/

export default class Connection {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.socket = this.connect();

    this.socket.on("diceRolled", (values) => {
      this.diceRolled(values);
    });

    this.socket.on("updatePlayers", (data) => {
      this.updatePlayers(data.players, data.playerNow);
    });
  }

  connect() {
    return io.connect("localhost:3000/", {
      query: "name=" + this.username + "&pw=" + this.password,
    });
  }

  createGame(name, size) {
    let con = this;
    let gameInfos = { name: name, size: size };
    this.socket.emit("createGame", gameInfos, function (game) {
      if (game != false) {
        console.log("Game " + game + "created.");
        con.gameCreated();
      } else {
        console.log("Game exists already.");
        con.gameNotCreated();
      }
    });
  }

  gameCreated() {}

  gameNotCreated() {}

  joinGame(name) {
    let con = this;
    this.socket.emit("joinGame", name, function (game) {
      if (game != false) {
        console.log("Game " + game + "joined.");
        con.gameJoined();
      } else {
        console.log("Game does not exist or player has already joined.");
        con.gameNotJoined();
      }
    });
  }

  gameJoined() {}

  gameNotJoined() {}

  startGame() {
    let con = this;
    this.socket.emit("startGame", function (returnValue) {
      if (!returnValue) {
        console.log("Game could not be started.");
      }
    });
  }

  roll(lockedDice = []) {
    this.socket.emit("roll", lockedDice);
  }

  diceRolled(values) {
    console.log(values);
    return values;
  }

  saveResult(selectedField) {
    let con = this;
    this.socket.emit("saveResult", selectedField, function (returnValue) {
      if (!returnValue) {
        console.log(
          "It is not your turn or result could not be safed into selected field."
        );
        con.resultNotSaved();
      }
    });
  }

  resultNotSaved() {}

  updatePlayers(players, playerNow) {
    console.log(players);
  }
}
