/*
Connection to server.
(c)2020 Florian Beck, Leander Schmidt and Garrit Schaap.
*/

export default class Client {
  constructor() {
    this.socket;

    this.fields = {
      ONES: "ones",
      TWOS: "twos",
      THREES: "threes",
      FOURS: "fours",
      FIVES: "fives",
      SIXES: "sixes",
      THREEOFAKIND: "threeOfAKind",
      FOUROFAKIND: "fourOfAKind",
      FULLHOUSE: "fullHouse",
      SMALLSTRAIGHT: "smallStraight",
      LARGESTRAIGHT: "largeStraight",
      KNIFFEL: "kniffel",
      CHANCE: "chance",
    };
    Object.freeze(this.fields);
    this.errorList = {
      "101": "You cannot create a game. You are already in a game.",
      "102": "A game with this name exists already.",
      "103": "A game needs at least one player.",
      "201": "You cannot join a game. You are already in a game.",
      "202": "A game with this name does not exist.",
      "203": "This game is full.",
      "204": "This game already started.",
      "301": "You cannot roll. You are not in this game.",
      "302": "You cannot roll. The game did not start yet.",
      "303": "You cannot roll. It is not your turn.",
      "304": "You already rolled 3 times.",
      "401": "The game could not be started. You are not in any game.",
      "402": "This game has already been started.",
      "501": "You cannot save the score. You are not in this game.",
      "502": "You cannot save the score. The game did not start yet.",
      "503": "You cannot save the score. It is not your turn.",
      "504": "The score could not be saved. The field is not empty.",
      "505": "The score could not be saved. The field does not exist.",
      "601": "You could not restart the game. You are not in any game.",
      "701": "You could not leave the game. You are not in any game.",
    };
    Object.freeze(this.errorList);
  }

  connect(username, password, url = "localhost:3000/") {
    let pwHash = calcMD5(password);
    this.socket = io.connect(url, {
      query: "name=" + username + "&pw=" + pwHash,
    });

    this.socket.on("diceRolled", this.diceRolled);
    this.socket.on("updatePlayers", this.updatePlayers);
    this.socket.on("playerLeft", this.playerLeft);
    this.socket.on("playerJoined", this.playerJoined);
    this.socket.on("gameStarted", this.gameStarted);
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
      if (con.errorList.hasOwnProperty(game)) {
        console.log("Error " + game + ": " + con.errorList[game]);
        con.gameNotCreated();
      } else {
        console.log("Game " + game + " created.");
        con.gameCreated();
      }
    });
  }

  gameCreated() {}

  gameNotCreated() {}

  joinGame(name) {
    let con = this;
    this.socket.emit("joinGame", name, function (game) {
      if (con.errorList.hasOwnProperty(game)) {
        console.log("Error " + game + ": " + con.errorList[game]);
        con.gameNotJoined();
      } else {
        console.log("Game " + game + "joined.");
        con.gameJoined();
      }
    });
  }

  gameJoined() {}

  gameNotJoined() {}

  leaveGame() {
    let con = this;
    this.socket.emit("leaveGame", function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
      }
    });
  }

  startGame() {
    let con = this;
    this.socket.emit("startGame", function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
      }
    });
  }

  gameStarted() {
    console.log("Game Started");
  }

  roll(lockedDice = []) {
    let con = this;
    this.socket.emit("roll", lockedDice, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.rollNotAllowed();
      }
    });
  }

  rollNotAllowed() {}

  diceRolled(values) {
    console.log(values);
  }

  saveResult(selectedField) {
    let con = this;
    this.socket.emit("saveResult", selectedField, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.resultNotSaved();
      }
    });
  }

  resultNotSaved() {}

  restartGame() {
    let con = this;
    this.socket.emit("restartGame", function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
      }
    });
  }

  updatePlayers(data) {
    console.log(data.players);
    console.log(data.playerNow);
  }

  playerJoined(player) {
    console.log("Player " + player + " joined the game.");
  }

  playerLeft(player) {
    console.log("Player " + player + " left the game.");
  }
}
