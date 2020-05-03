/*
Game class.
(c)2020 Florian Beck and Leander Schmidt.
*/

import Player from "./player.mjs";
import Dice from "./dice.mjs";

export default class Game {
  constructor(name, size) {
    this.name = name;
    this.players = [];
    this.playerNow = 0;
    this.size = size;
    this.dice = [];
    for (let i = 0; i < 5; i++) {
      this.dice.push(new Dice());
    }
  }

  join(socketId) {
    if (this.getPlayerIndex(socketId) < 0) {
      let player = new Player(socketId);
      this.players.push(player);
      console.log(
        "Player " + player.getName() + " joined the game " + this.name + "."
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
        " left the game " +
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

  lockDice(array) {
    for (let element of this.dice) {
      element.unlock();
    }
    for (let index in array) {
      this.dice[array[index]].lock();
    }
  }

  rollDice() {
    for (let element of this.dice) {
      element.roll();
    }
    return this.getDice();
  }

  getDice() {
    let values = [];
    for (let element of this.dice) {
      values.push(element.value);
    }
    return values;
  }
}
