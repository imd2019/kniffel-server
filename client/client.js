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
      "001": "Could not connect to the server.",
      "002": "Could not connect to the server. The provided password is wrong.",
      "101": "You cannot create a game. You are already in a game.",
      "102": "A game with this name exists already.",
      "103": "A game needs at least one player.",
      "201": "You cannot join more than one game. You are already in a game.",
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
      "506": "This game is not of type complete. The score cannot be saved.",
      "601": "You could not restart the game. You are not in any game.",
      "701": "You could not leave the game. You are not in any game.",
    };
    Object.freeze(this.errorList);

    // event management

    this.eventListeners = [];

    this.addEventListener = function (type, eventHandler) {
      let listener = {};
      listener.type = type;
      listener.eventHandler = eventHandler;
      this.eventListeners.push(listener);
    };

    this.dispatchEvent = function (event) {
      for (let index in this.eventListeners) {
        if (event.type === this.eventListeners[index].type)
          this.eventListeners[index].eventHandler(event);
      }
    };

    this.addEventListener("gamesListReturned", this.onGamesListReturned);
    this.addEventListener("gameCreated", this.onGameCreated);
    this.addEventListener("gameNotCreated", this.onGameNotCreated);
    this.addEventListener("gameJoined", this.onGameJoined);
    this.addEventListener("gameNotJoined", this.onGameNotJoined);
    this.addEventListener("gameStarted", this.onGameStarted);
    this.addEventListener("diceRolled", this.onDiceRolled);
    this.addEventListener("rollNotAllowed", this.onRollNotAllowed);
    this.addEventListener("resultNotSaved", this.onResultNotSaved);
    this.addEventListener("updatePlayers", this.onUpdatePlayers);
    this.addEventListener("playerJoined", this.onPlayerJoined);
    this.addEventListener("playerLeft", this.onPlayerLeft);
  }

  connect(username, password, url = "localhost:3000/") {
    let manager = io.Manager(url);
    let con = this;
    manager.on("connect_error", function () {
      console.log("Error 001: " + con.errorList["001"]);
    });

    let pwHash = calcMD5(password);
    this.socket = io.connect(url, {
      query: "name=" + username + "&pw=" + pwHash,
    });

    this.socket.on("wrongPassword", function () {
      console.log("Error 002: " + con.errorList["002"]);
    });

    this.socket.on("playerJoined", this.dispatchEvent("playerJoined"));
    this.socket.on("gameStarted", this.dispatchEvent("gameStarted"));
    this.socket.on("diceRolled", this.dispatchEvent("diceRolled"));
    this.socket.on("updatePlayers", this.dispatchEvent("updatePlayers"));
    this.socket.on("playerLeft", this.dispatchEvent("playerLeft"));
  }

  getGamesList() {
    this.socket.emit("getGames", this.gamesListReturned);
  }

  onGamesListReturned(games) {
    console.log(games);
  }

  createGame(name, size, complete) {
    let con = this;
    let gameInfos = { name: name, size: size, complete: complete };
    this.socket.emit("createGame", gameInfos, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.dispatchEvent("gameNotCreated");
      } else {
        console.log("Game " + returnValue + " created.");
        con.dispatchEvent("gameCreated");
      }
    });
  }

  onGameCreated() {}

  onGameNotCreated() {}

  joinGame(name) {
    let con = this;
    this.socket.emit("joinGame", name, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.dispatchEvent("gameNotJoined");
      } else {
        console.log("Game " + returnValue + "joined.");
        con.dispatchEvent("gameJoined");
      }
    });
  }

  onGameJoined() {}

  onGameNotJoined() {}

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

  onGameStarted() {
    console.log("Game Started");
  }

  roll(lockedDice = []) {
    let con = this;
    this.socket.emit("roll", lockedDice, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.dispatchEvent("rollNotAllowed");
      }
    });
  }

  onDiceRolled(values) {
    console.log(values);
  }

  onRollNotAllowed() {}

  saveResult(selectedField) {
    let con = this;
    this.socket.emit("saveResult", selectedField, function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
        con.dispatchEvent("resultNotSaved");
      }
    });
  }

  onResultNotSaved() {}

  restartGame() {
    let con = this;
    this.socket.emit("restartGame", function (returnValue) {
      if (con.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + con.errorList[returnValue]);
      }
    });
  }

  onUpdatePlayers(data) {
    console.log(data.players);
    console.log(data.playerNow);
  }

  onPlayerJoined(player) {
    console.log("Player " + player + " joined the game.");
  }

  onPlayerLeft(player) {
    console.log("Player " + player + " left the game.");
  }
}
