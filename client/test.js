import Client from "./client.js";

let client = new Client();

client.addEventListener("gameIsStarted", myFunction);

client.connect("Tester", "ILoveIMD2020");
client.createGame("Partykammer", 4, false);
//client.joinGame("Partykammer");
client.getGamesList();
client.startGame();
// client.roll();
// client.roll([1, 4]);
// client.roll();
// client.roll();
// client.saveResult(client.fields.ONES);

function myFunction() {
  console.log("EventListener works!!!");
}
