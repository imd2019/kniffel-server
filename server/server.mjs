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

  socket.on("createGame", (gameInfos) => {
    createGame(gameInfos, socket);
  });

  socket.on("joinGame", (gameName) => {
    joinGame(gameName, socket);
  });

  socket.on("disconnect", () => {
    console.log("Player with id " + socket.id + " disconnected.");
    delete SOCKET_LIST[socket.id];
  });
}

function createGame(gameInfos, socket) {
  if (!gameExists(gameInfos.name)) {
    socket.join(gameInfos.name, function () {
      console.log(
        "Player " + socket.id + " created Room " + gameInfos.name + "."
      );
    });
    let game = new Game(gameInfos.name, gameInfos.size);
    game.join(socket.id);
    games[game.name] = game;
    //console.log(games);
  } else {
    console.log("Game exists already"); // EVTL noch zu einem Event für die Clientseite hinzufügen
  }
}

function joinGame(gameName, socket) {
  if (gameExists(gameName)) {
    let game = games[gameName];
    socket.join(gameName, function () {
      console.log("Player " + socket.id + " joined Room " + gameName + ".");
    });
    game.join(socket.id);
  }
}

function gameExists(name) {
  return games.hasOwnProperty(name);
}
