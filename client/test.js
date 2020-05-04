import Client from "./client.js";

let client = new Client();

client.connect("Tester", "ILoveIMD2020");
client.createGame("Partykammer", 4, true);
client.joinGame("Partykammer");
client.getGamesList();
client.roll();
client.roll([1, 4]);
client.roll();
client.roll();
client.saveResult(client.fields.ONES);
