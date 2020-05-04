/*
Genereal server setup and communication.
(c)2020 Florian Beck, Leander Schmidt and Garrit Schaap.
*/

import Game from "./game.mjs";
import express from "express";
import socket from "socket.io";
import crypto from "crypto";

// setup

let app = express();
const port = process.env.PORT || 3000;
const password = process.env.PASSWORD || "ILoveIMD2020";
let pwHash = crypto.createHash("md5").update(password).digest("hex");

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
  if (pwHash === socket.handshake.query.pw) {
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
  if (getGameBySocketId(socket.id)) return "101";
  if (gameExists(gameInfos.name)) return "102";
  if (gameInfos.size < 1) return "103";

  socket.join(gameInfos.name, function () {
    console.log(
      "Player " + socket.id + " created room " + gameInfos.name + "."
    );
  });
  let game = new Game(gameInfos.name, gameInfos.size, gameInfos.complete);
  game.join(socket.id);
  games[game.name] = game;
  return game.name;
  // console.log("Game exists already or size is to small."); // EVTL noch zu einem Event für die Clientseite hinzufügen
  // return false;
}

function joinGame(gameName, socket) {
  if (getGameBySocketId(socket.id)) return "201";
  if (!gameExists(gameName)) return "202";
  if (games[gameName].players.length >= games[gameName].size) return "203";
  if (games[gameName].playerNow >= 0) return "204";

  // if (games[gameName].getPlayerIndex(socket.id) >= 0) {
  //   console.log("Player is already in this game.");        ???????????????????
  //   return false;
  // }
  let game = games[gameName];
  socket.join(gameName, function () {
    console.log("Player " + socket.id + " joined room " + gameName + ".");
  });
  game.join(socket.id);
  io.to(game.name).emit("playerJoined", socket.name);
  return gameName;
}

function leaveGame(socketId) {
  let game = getGameBySocketId(socketId);
  if (!game) return "701";

  let player = game.players[game.getPlayerIndex(socketId)].getName();
  if (game.leave(socketId)) {
    console.log("Game " + game.name + " deleted. All players left.");
    delete games[game.name];
  } else {
    io.to(game.name).emit("playerLeft", player);
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
  if (!game) return "401";
  if (!game.start()) return "402";

  io.to(game.name).emit("gameStarted");
  return true;
}

function roll(lockedDice, socketId) {
  let game = getGameBySocketId(socketId);
  if (!game) return "301";
  if (!game.isPlayerNow(socketId)) return "303";

  game.lockDice(lockedDice);
  let values = game.rollDice();
  if (values === "302") return "302";
  if (values === "304") return "304";
  io.to(game.name).emit("diceRolled", values);
  return true;
}

function saveResult(selectedField, socketId) {
  let game = getGameBySocketId(socketId);
  if (!game) return "501";
  if (!game.isPlayerNow(socketId)) return "503";
  let isScoreSafe = game.saveScore(selectedField);
  if (isScoreSafe === "502") return "502";
  if (isScoreSafe === "504") return "504";
  if (isScoreSafe === "505") return "505";

  updatePlayers(socketId);
  return true;
}

function restartGame(socketId) {
  let game = getGameBySocketId(socketId);
  if (!game) return "601";

  if (game.restart()) {
    io.to(game.name).emit("gameStarted");
    return true;
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
