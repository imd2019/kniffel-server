/*
Genereal server setup and communication.
(c)2020 Florian Beck, Leander Schmidt and Garrit Schaap.
*/

import Game from "./game.mjs";
import express from "express";
import socket from "socket.io";

// setup

let app = express();
const port = process.env.PORT || 3000;
const password = process.env.PASSWORD || "ILoveIMD2020";
let server = app.listen(port);
console.log("Server listening on port " + port + " ...");

let io = socket(server);

global.SOCKET_LIST = {};
let games = {};

// communication

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  console.log("New player with id " + socket.id + " connected.");
  //console.log(socket.handshake.query);
  if (password === socket.handshake.query.pw) {
    SOCKET_LIST[socket.id] = socket;
    socket.name = socket.handshake.query.name;
    console.log(
      "Player with id " + socket.id + " set name to " + socket.name + "."
    );
  } else {
    console.log(
      "Player with id " +
        socket.id +
        " disconnected from Server. WRONG PASSWORD."
    );
    socket.disconnect();
  }

  socket.on("getGames", (callback) => {
    callback(getGames());
  });

  socket.on("createGame", (gameInfos, callback) => {
    callback(createGame(gameInfos, socket));
  });

  socket.on("joinGame", (gameName, callback) => {
    callback(joinGame(gameName, socket));
  });

  socket.on("leaveGame", () => {
    leaveGame(socket.id);
  });

  socket.on("startGame", (callback) => {
    callback(startGame(socket.id));
  });

  socket.on("roll", (lockedDice, callback) => {
    callback(roll(lockedDice, socket.id));
  });

  socket.on("saveResult", (selectedField, callback) => {
    callback(saveResult(selectedField, socket.id));
  });

  socket.on("restartGame", () => {
    restartGame(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Player with id " + socket.id + " disconnected.");
    leaveGame(socket.id);
    delete SOCKET_LIST[socket.id];
  });
}

function getGames() {
  let gamesList = [];
  for (let index in games) {
    gamesList.push({
      name: index,
      size: games[index].size,
      playerCount: games[index].players.length,
    });
  }
  return gamesList;
}

function createGame(gameInfos, socket) {
  if (
    !getGameBySocketId(socket.id) &&
    !gameExists(gameInfos.name) &&
    gameInfos.size > 0
  ) {
    socket.join(gameInfos.name, function () {
      console.log(
        "Player " + socket.id + " created room " + gameInfos.name + "."
      );
    });
    let game = new Game(gameInfos.name, gameInfos.size, gameInfos.complete);
    game.join(socket.id);
    games[game.name] = game;
    return game.name;
  }
  console.log("Game exists already or size is to small."); // EVTL noch zu einem Event für die Clientseite hinzufügen
  return false;
}

function joinGame(gameName, socket) {
  if (
    !getGameBySocketId(socket.id) &&
    gameExists(gameName) &&
    games[gameName].players.length < games[gameName].size
  ) {
    if (games[gameName].getPlayerIndex(socket.id) >= 0) {
      console.log("Player is already in this game.");
      return false;
    }
    let game = games[gameName];
    socket.join(gameName, function () {
      console.log("Player " + socket.id + " joined room " + gameName + ".");
    });
    game.join(socket.id);
    return gameName;
  }
  console.log(
    "Player " +
      socket.id +
      " tried to join non-existent game or the game is full."
  );
  return false;
}

function leaveGame(socketId) {
  let game = getGameBySocketId(socketId);
  if (game) {
    if (game.leave(socketId)) {
      console.log("Game " + game.name + " deleted. All players left.");
      delete games[game.name];
    }
  }
}

function gameExists(name) {
  return games.hasOwnProperty(name);
}

function getGameBySocketId(socketId) {
  for (let index in games) {
    if (games[index].getPlayerIndex(socketId) >= 0) return games[index];
  }
  return false;
}

function startGame(socketId) {
  let game = getGameBySocketId(socketId);
  if (game) {
    if (game.start()) {
      return true;
    }
  }
  return false;
}

function roll(lockedDice, socketId) {
  let game = getGameBySocketId(socketId);
  if (game) {
    game.lockDice(lockedDice);

    let values = game.rollDice();
    if (values) {
      io.to(game.name).emit("diceRolled", values);
      return true;
    }
  }
  return false;
}

function saveResult(selectedField, socketId) {
  let game = getGameBySocketId(socketId);
  if (game) {
    if (game.isPlayerNow(socketId)) {
      if (!game.saveScore(selectedField)) return false;
      updatePlayers(socketId);
      return true;
    }
  }
  return false;
}

function restartGame(socketId) {
  let game = getGameBySocketId(socketId);
  if (game) {
    if (game.restart()) {
      return true;
    }
  }
  return false;
}

function updatePlayers(socketId) {
  let game = getGameBySocketId(socketId);
  let players = [];
  for (let index in game.players) {
    let player = {};
    player.scores = game.players[index].scores;
    player.name = game.players[index].getName();
    players.push(player);
  }

  let data = { players: players, playerNow: game.playerNow };

  io.to(game.name).emit("updatePlayers", data);
}
