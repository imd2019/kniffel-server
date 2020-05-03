import Connection from "./connection.js";

let connection = new Connection("test", "ILoveIMD2020");

connection.createGame("Partykammer", 4);
connection.joinGame("Partykammer");
connection.roll();
connection.roll([1, 4]);
