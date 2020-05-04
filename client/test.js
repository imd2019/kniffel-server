import Client from "./client.js";

let connection = new Client("test", "ILoveIMD2020");

connection.createGame("Partykammer", 1, true);
connection.createGame("Paaaartyyyyy!!!", 1, true);
connection.getGamesList();
connection.joinGame("Partykammer");
connection.startGame();
connection.roll();
connection.roll([1, 4]);
connection.roll();
connection.roll();
connection.saveResult("ones");
connection.leaveGame();
