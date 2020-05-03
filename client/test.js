import Connection from "./connection.js";

let connection = new Connection("test", "ILoveIMD2020");

connection.createRoom("Partykammer", 4);
connection.joinRoom("Partykammer");
