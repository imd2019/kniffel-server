/*
Game class.
(c)2020 Florian Beck and Leander Schmidt.
*/

export default class Dice {
  constructor() {
    this.value = this.getRandomValue();
    this.locked = false;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  getRandomValue() {
    return Math.ceil(Math.random() * 6);
  }

  roll() {
    if (!this.locked) {
      this.value = this.getRandomValue();
    }
  }

  reset() {
    this.locked = false;
    this.roll();
  }
}
