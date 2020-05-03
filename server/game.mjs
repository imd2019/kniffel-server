/*
Game class.
(c)2020 Florian Beck and Leander Schmidt.
*/

import Player from "./player.mjs";

export default class Game {
  constructor(name, size) {
    this.name = name;
    this.players = [];
    this.playerNow = 0;
    this.size = size;
  }

  join(socketId) {
    if (this.getPlayerIndex(socketId) < 0) {
      let player = new Player(socketId);
      this.players.push(player);
      console.log(
        "Player " + player.getName() + " joined the Game " + this.name + "."
      );
      return true;
    }
    return false;
  }

  leave(socketId) {
    let index = this.getPlayerIndex(socketId);
    console.log(
      "Player " +
        this.players[index].getName() +
        " left the Game " +
        this.name +
        "."
    );
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }
  getPlayerIndex(socketId) {
    for (let index in this.players) {
      if (this.players[index].socketId === socketId) {
        return index;
      }
    }
    return -1;
  }
}
