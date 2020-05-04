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
      "102": "A Game with this name already exists.",
      "103": "The size of your game is to small.",
      "201": "You cannot join a game.You are already in a game.",
      "202": "The game with the given name does not exsits.",
      "203": "This game is already full.",
      "204": "This game already started.",
      "301": "You cannot roll the dice. You are not in the game.",
      "302": "You cannot roll the dice. Game did not start.",
      "303": "You cannot roll the dice. Game did not start.",
      "304": "You already rolled 3 times.",
      "401": "Game could not be started. You are not in a game.",
      "402": "Game already started",
      "501": "You cannot save the score. You are not in the game.",
      "502": "You cannot save the score. Game did not start.",
      "503": "You cannot save the score. It is not your turn.",
      "504": "Score could not be saved.There is already score in this field.",
      "505": "Score could not be saved. Field does not exists.",
      "601": "You could not restart the game. You are not in any game.",
      "701": "You could not leave a game. You are not in any game",
    };
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
