/*
Genereal server setup and communication.
(c)2020 Florian Beck and Leander Schmidt.
*/

// setup

let express = require("express");
let app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port);
const password = "ILoveIMD2020";
console.log("Server listening on port " + port + " ...");

let socket = require("socket.io");
let io = socket(server);

global.SOCKET_LIST = {};
let games = [];

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
  if (findGame(gameInfos.name) === false) {
    games.push(gameInfos);
    //console.log(games);
    socket.join(gameInfos.name, function () {
      console.log(
        "Player " + socket.id + " created Room " + gameInfos.name + "."
      );
    });
  } else {
    console.log("Game exists already"); // EVTL noch zu einem Event für die Clientseite hinzufügen
  }
}

function joinGame(gameName, socket) {
  let game = findGame(gameName);
  if (game != false) {
    socket.join(gameName, function () {
      console.log("Player " + socket.id + " joined Room " + gameName + ".");
    });
  }
}

function findGame(name) {
  for (let index of games) {
    if (index.name === name) {
      return index;
    }
  }
  return false;
}
