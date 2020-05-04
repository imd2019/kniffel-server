import Client from "./client.js";

let client = new Client("test", "ILoveIMD2020");

client.connect("Tester", "ILoveIMD2020");
client.createGame("Partykammer", 1, true);
client.createGame("Paaaartyyyyy!!!", 1, true);
client.getGamesList();
client.joinGame("Partykammer");
client.startGame();
client.roll();
client.roll([1, 4]);
client.roll();
client.roll();
client.saveResult("ones");
