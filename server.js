/*
Genereal server setup and communication.
(c)2020 Florian Beck and Leander Schmidt.
*/

// setup

let express = require("express");
let app = express();
const port = process.env.PORT || 3000;
let server = app.listen(port);

console.log("Server listening on port " + port + " ...");

let socket = require("socket.io");
let io = socket(server);

global.SOCKET_LIST = {};

io.sockets.on("connection", newConnection);

function newConnection(socket) {
  SOCKET_LIST[socket.id] = socket;
}
