import Connection from "./connection.js";

let connection = new Connection("test", "ILoveIMD2020");

connection.createGame("Partykammer", 1);
connection.createGame("Paaaartyyyyy!!!", 1);
connection.getGamesList();
connection.joinGame("Partykammer");
connection.startGame();
connection.roll();
connection.roll([1, 4]);
connection.roll();
connection.roll();
connection.saveResult("ones");
connection.leaveGame();
