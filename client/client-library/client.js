/*
Connection to server.
(c)2020 Florian Beck, Leander Schmidt and Garrit Schaap.
*/

import MD5 from "./lib/md5.js";
import EventDispatcher from "./eventDispatcher.js";

let md5 = new MD5();

export default class Client extends EventDispatcher {
  constructor() {
    super();
    this.socket;

    this.fields = {
      ONES: "ones",
      TWOS: "twos",
      THREES: "threes",
      FOURS: "fours",
      FIVES: "fives",
      SIXES: "sixes",
      THREE_OF_A_KIND: "threeOfAKind",
      FOUR_OF_A_KIND: "fourOfAKind",
      FULL_HOUSE: "fullHouse",
      SMALL_STRAIGHT: "smallStraight",
      LARGE_STRAIGHT: "largeStraight",
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

    this.eventNames = {
      GAMES_LIST_RETURNED: "gamesListReturned",
      GAME_CREATED: "gameCreated",
      GAME_NOT_CREATED: "gameNotCreated",
      GAME_JOINED: "gameJoined",
      GAME_NOT_JOINED: "gameNotJoined",
      GAME_STARTED: "gameStarted",
      ROLL_NOT_ALLOWED: "rollNotAllowed",
      DICE_ROLLED: "diceRolled",
      RESULT_NOT_SAVED: "resultNotSaved",
      UPDATE_PLAYERS: "updatePlayers",
      PLAYER_JOINED: "playerJoined",
      PLAYER_LEFT: "playerLeft"
    }
    Object.freeze(this.eventNames);
  }

  connect(username, password, url = "localhost:3000/") {
    let manager = io.Manager(url);
    let con = this;
    manager.on("connect_error", function () {
      console.log("Error 001: " + con.errorList["001"]);
    });

    const salt = "DingoBingoBongoCat";
    let pwHash = md5.calc(password + salt);
    this.socket = io.connect(url, {
      query: "name=" + username + "&pw=" + pwHash,
    });

    this.socket.on("wrongPassword", function () {
      console.log("Error 002: " + con.errorList["002"]);
    });
    this.socket.on("playerJoined", this.playerJoined.bind(this));
    this.socket.on("gameStarted", this.gameStarted.bind(this));
    this.socket.on("diceRolled", this.diceRolled.bind(this));
    this.socket.on("updatePlayers", this.updatePlayers.bind(this));
    this.socket.on("playerLeft", this.playerLeft.bind(this));
  }

  getGamesList() {
    this.socket.emit("getGames", (games) => {
      let ev = new CustomEvent(this.eventNames.GAMES_LIST_RETURNED, {detail: games});
      this.dispatchEvent(ev);
    });
  }

  createGame(name, size, complete) {
    let gameInfos = { name: name, size: size, complete: complete };
    this.socket.emit("createGame", gameInfos, (game) => {
      if (this.errorList.hasOwnProperty(game)) {
        console.log("Error " + game + ": " + this.errorList[game]);
        this.dispatchEvent(new CustomEvent(this.eventNames.GAME_NOT_CREATED));
      } else {
        console.log("Game " + game + " created.");
        this.dispatchEvent(new CustomEvent(this.eventNames.GAME_CREATED));
      }
    });
  }

  joinGame(name) {
    this.socket.emit("joinGame", name, (game) => {
      if (this.errorList.hasOwnProperty(game)) {
        console.log("Error " + game + ": " + this.errorList[game]);
        this.dispatchEvent(new CustomEvent(this.eventNames.GAME_JOINED));
      } else {
        console.log("Game " + game + "joined.");
        this.dispatchEvent(new CustomEvent(con.eventNames.GAME_NOT_JOINED));
      }
    });
  }

  leaveGame() {
    this.socket.emit("leaveGame", (returnValue) => {
      if (this.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + this.errorList[returnValue]);
      }
    });
  }

  startGame() {
    this.socket.emit("startGame", (returnValue) => {
      if (this.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + this.errorList[returnValue]);
      }
    });
  }

  gameStarted() {
    let ev = new CustomEvent(this.eventNames.GAME_STARTED);
    this.dispatchEvent(ev);
  }

  roll(lockedDice = []) {
    this.socket.emit("roll", lockedDice, (returnValue) => {
      if (this.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + this.errorList[returnValue]);
        this.dispatchEvent(new CustomEvent(this.eventNames.ROLL_NOT_ALLOWED));
      }
    });
  }

  diceRolled(values) {
    this.dispatchEvent(new CustomEvent(this.eventNames.DICE_ROLLED, {detail: values}));
  }

  saveResult(selectedField) {
    this.socket.emit("saveResult", selectedField, (returnValue) => {
      if (this.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + this.errorList[returnValue]);
        this.dispatchEvent(new CustomEvent(this.eventNames.RESULT_NOT_SAVED));
      }
    });
  }

  restartGame() {
    this.socket.emit("restartGame", function (returnValue) {
      if (this.errorList.hasOwnProperty(returnValue)) {
        console.log("Error " + returnValue + ": " + this.errorList[returnValue]);
      }
    });
  }

  updatePlayers(data) {
    this.dispatchEvent(new CustomEvent(this.eventNames.UPDATE_PLAYERS, {detail: data}));
  }

  playerJoined(player) {
    this.dispatchEvent(new CustomEvent(this.eventNames.PLAYER_JOINED, {detail: player}));
  }

  playerLeft(player) {
    this.dispatchEvent(new CustomEvent(this.eventNames.PLAYER_LEFT, {detail: player}));
  }
}
