/*
Genereal server setup and communication.
(c)2020 Florian Beck and Leander Schmidt.
*/

import Game from "./game.mjs";
import express from "express";
import socket from "socket.io";

// setup
//let express = require("express");
let app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port);
const password = "ILoveIMD2020";
console.log("Server listening on port " + port + " ...");

//let socket = require("socket.io");
let io = socket(server);

global.SOCKET_LIST = {};
let games = {};

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

  socket.on("createGame", (gameInfos, callback) => {
    callback(createGame(gameInfos, socket));
  });

  socket.on("joinGame", (gameName, callback) => {
    callback(joinGame(gameName, socket));
  });

  socket.on("startGame", (callback) => {
    callback(startGame(socket.id));
  });

  socket.on("roll", (lockedDice) => {
    roll(lockedDice, socket.id);
  });

  socket.on("saveResult", (selectedField, callback) => {
    callback(saveResult(selectedField, socket.id));
  });

  socket.on("disconnect", () => {
    console.log("Player with id " + socket.id + " disconnected.");
    if (getGameBySocketId(socket.id) != false) {
      getGameBySocketId(socket.id).leave(socket.id);
    }
    delete SOCKET_LIST[socket.id];
  });
}

function createGame(gameInfos, socket) {
  if (!gameExists(gameInfos.name)) {
    socket.join(gameInfos.name, function () {
      console.log(
        "Player " + socket.id + " created room " + gameInfos.name + "."
      );
    });
    let game = new Game(gameInfos.name, gameInfos.size);
    game.join(socket.id);
    games[game.name] = game;
    //console.log(games);
    return game.name;
  }
  console.log("Game exists already."); // EVTL noch zu einem Event für die Clientseite hinzufügen
  return false;
}

function joinGame(gameName, socket) {
  if (gameExists(gameName)) {
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
  console.log("Player " + socket.id + " tried to join non-existent game.");
  return false;
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
  if (game.start()) {
    return true;
  }
  return false;
}

function roll(lockedDice, socketId) {
  let game = getGameBySocketId(socketId);
  game.lockDice(lockedDice);

  let values = game.rollDice();
  io.to(game.name).emit("diceRolled", values);
}

function saveResult(selectedField, socketId) {
  let game = getGameBySocketId(socketId);
  if (game.isPlayerNow(socketId)) {
    updatePlayers(socketId);
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
