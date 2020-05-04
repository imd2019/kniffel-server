/*
Connection to server.
(c)2020 Florian Beck and Leander Schmidt.
*/

export default class Client {
  constructor() {
    this.socket;

    this.socket.on("diceRolled", this.diceRolled);

    this.socket.on("updatePlayers", (data) => {
      this.updatePlayers(data.players, data.playerNow);
    });
  }

  connect(url = "localhost:3000/", username, password) {
    this.socket = io.connect(url, {
      query: "name=" + this.username + "&pw=" + this.password,
    });
  }

  getGamesList() {
    this.socket.emit("getGames", this.gamesListReturned);
  }

  gamesListReturned(games) {
    console.log(games);
  }

  createGame(name, size, complete) {
    let con = this;
    let gameInfos = { name: name, size: size, complete: complete };
    this.socket.emit("createGame", gameInfos, function (game) {
      if (game) {
        console.log("Game " + game + " created.");
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
      if (game) {
        console.log("Game " + game + "joined.");
        con.gameJoined();
      } else {
        console.log(
          "Game does not exist, you are already in a game or player has already joined."
        );
        con.gameNotJoined();
      }
    });
  }

  gameJoined() {}

  gameNotJoined() {}

  leaveGame() {
    this.socket.emit("leaveGame");
  }

  startGame() {
    let con = this;
    this.socket.emit("startGame", function (returnValue) {
      if (!returnValue) {
        console.log("Game could not be started.");
      }
    });
  }

  roll(lockedDice = []) {
    let con = this;
    this.socket.emit("roll", lockedDice, function (returnValue) {
      if (!returnValue) {
        console.log("Maximum throws reached.");
        con.rollNotAllowed();
      }
    });
  }

  rollNotAllowed() {}

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

  restartGame() {
    this.socket.emit("restartGame");
  }

  updatePlayers(players, playerNow) {
    console.log(players);
  }
}
