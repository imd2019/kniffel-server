import Client from "./client.js";

let client = new Client();

client.connect("Tester", "ILoveIMD2020");
client.createGame("Partykammer", 4, false);
//client.joinGame("Partykammer");
client.getGamesList();
client.startGame();
client.roll();
client.roll([1, 4]);
client.roll();
client.roll();
client.saveResult(client.fields.ONES);

client.addEventListener("wrongPassword", function () {
  console.log("Wrong Password!");
});

client.addEventListener("gameCreated", function () {
  console.log("Game created!!!");
});

client.addEventListener("gameStarted", function () {
  console.log("Game started!");
});

client.addEventListener("gamesListReturned", function (games) {
  console.log(games);
});

client.addEventListener("diceRolled", (values) => {
  console.log(values);
});

client.addEventListener("updatePlayers", (data) => {
  console.log(data.players);
  console.log(data.playerNow);
});

client.addEventListener("playerJoined", (player) => {
  console.log("Player " + player + " joined the game.");
});

client.addEventListener("playerLeft", (player) => {
  console.log("Player " + player + " left the game.");
});
