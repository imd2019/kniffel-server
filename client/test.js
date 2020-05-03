import Connection from "./connection.js";

let connection = new Connection("test", "ILoveIMD2020");

console.log(connection);
let gameInfos = { name: "name", size: 4 };
connection.socket.emit("createGame", gameInfos);
connection.socket.emit("joinGame", gameInfos.name);
