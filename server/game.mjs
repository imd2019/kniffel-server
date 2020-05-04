/*
Game class.
(c)2020 Florian Beck and Leander Schmidt.
*/

import Player from "./player.mjs";
import Dice from "./dice.mjs";

export default class Game {
  constructor(name, size, complete) {
    this.name = name;
    this.players = [];
    this.playerNow = -1;
    this.size = size;
    this.dice = [];
    for (let i = 0; i < 5; i++) {
      this.dice.push(new Dice());
    }
    this.throws = 0;
    this.complete = complete;
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
    if (this.playerNow >= this.players.length) {
      this.playerNow = 0;
    }

    if (this.players.length <= 0) return true;
    return false;
  }

  getPlayerIndex(socketId) {
    for (let index in this.players) {
      if (this.players[index].socketId === socketId) {
        return index;
      }
    }
    return -1;
  }

  isPlayerNow(socketId) {
    return socketId === this.players[this.playerNow].socketId;
  }

  start() {
    if (this.playerNow < 0) {
      // determine random start player
      this.players.unshift(
        this.players.splice(
          Math.floor(Math.random() * this.players.length),
          1
        )[0]
      );

      this.playerNow = 0;
      return true;
    }
    return false;
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
    if (this.throws < 3 && this.playerNow >= 0) {
      for (let element of this.dice) {
        element.roll();
      }
      this.throws++;
      return this.getDice();
    }
    return false;
  }

  getDice() {
    let values = [];
    for (let element of this.dice) {
      values.push(element.value);
    }
    return values;
  }

  saveScore(selectedField) {
    if (this.playerNow >= 0) {
      let plNow = this.players[this.playerNow];
      if (plNow.scores[selectedField] === null) {
        plNow.scores[selectedField] = this.calcScore(selectedField);
        plNow.calcTotal(this.complete);
        this.nextTurn();
        return true;
      }
    }
    return false;
  }

  nextTurn() {
    if (this.playerNow < this.players.length) {
      this.playerNow++;
    } else {
      this.playerNow = 0;
    }

    for (let element of this.dice) {
      element.reset();
    }

    this.throws = 0;
  }

  restart() {
    this.nextTurn();
    for (let element of this.players) {
      element.reset();
    }
    return this.start();
  }

  /* Calc results from dice */

  calcScore(selectedField) {
    this.sortDice();
    switch (selectedField) {
      case "ones":
        return this.addNumOfAKind(1);
      case "twos":
        return this.addNumOfAKind(2);
      case "threes":
        return this.addNumOfAKind(3);
      case "fours":
        return this.addNumOfAKind(4);
      case "fives":
        return this.addNumOfAKind(5);
      case "sixes":
        return this.addNumOfAKind(6);
      case "threeOfAKind":
        return this.threeOfAKind();
      case "fourOfAKind":
        return this.fourOfAKind();
      case "fullHouse":
        return this.fullHouse();
      case "smallStraight":
        return this.smallStraight();
      case "largeStraight":
        return this.largeStraight();
      case "kniffel":
        return this.yahtzee();
      case "chance":
        return this.addAll();
      default:
        return false;
    }
  }

  sortDice() {
    this.dice.sort((a, b) => a.value - b.value);
  }

  addNumOfAKind(int) {
    let result = 0;
    this.dice.forEach((d) => {
      if (d.value === int) {
        result += int;
      }
    });
    return result;
  }

  addAll() {
    let result = 0;
    this.dice.forEach((d) => {
      result += d.value;
    });
    return result;
  }

  maxTwoDifferent() {
    let pre = this.dice[0].value;
    let errors = 0;

    for (let index in this.dice) {
      if (this.dice[index].value != pre) {
        errors++;
        if (errors > 1) {
          return false;
        }
      }
      pre = this.dice[index].value;
    }
    return true;
  }

  threeOfAKind() {
    let pre = this.dice[0].value;
    let errors = 0;

    for (let index in this.dice) {
      if (this.dice[index].value != pre) {
        errors++;
        if (errors > 2) {
          return 0;
        }
      }
      pre = this.dice[index].value;
    }
    return this.addAll();
  }

  fourOfAKind() {
    if (
      this.maxTwoDifferent() &&
      (this.dice[0].value === this.dice[1].value ||
        this.dice[3].value === this.dice[4].value)
    ) {
      return this.addAll();
    }
    return 0;
  }

  fullHouse() {
    if (
      this.maxTwoDifferent() &&
      this.dice[0].value === this.dice[1].value &&
      this.dice[3].value === this.dice[4].value
    ) {
      return 25;
    }
    return 0;
  }

  smallStraight() {
    let pre = this.dice[0].value;
    let errors = 0;

    for (let index in this.dice) {
      if (this.dice[index].value != pre + 1) {
        errors++;
        if (errors > 2) {
          return 0;
        }
      }
      pre = this.dice[index].value;
    }
    return 30;
  }

  largeStraight() {
    let pre = this.dice[0].value;
    let errors = 0;

    for (let index in this.dice) {
      if (this.dice[index].value != pre + 1) {
        errors++;
        if (errors > 1) {
          return 0;
        }
      }
      pre = this.dice[index].value;
    }
    return 40;
  }

  yahtzee() {
    let first = this.dice[0].value;
    for (let index in this.dice) {
      if (this.dice[index].value != first) {
        return 0;
      }
    }
    return 50;
  }
}
