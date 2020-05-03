/*
Game class.
(c)2020 Florian Beck and Leander Schmidt.
*/

export default class Game {
  constructor(name) {
    this.name = name;
    this.players = [];
    this.playerNow = 0;
  }
  join(socketId) {}
}
