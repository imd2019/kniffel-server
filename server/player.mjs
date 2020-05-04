export default class Player {
  constructor(socketId) {
    this.scores = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      bonus: 0,
      threeOfAKind: null,
      fourOfAKind: null,
      fullHouse: null,
      smallStraight: null,
      largeStraight: null,
      kniffel: null,
      chance: null,
      total: 0,
    };
    this.socketId = socketId;
  }
  getName() {
    return SOCKET_LIST[this.socketId].name;
  }

  calcTopHalve() {
    let result = 0;
    for (let index in this.scores) {
      if (index === "bonus") {
        break;
      }
      result += this.scores[index];
    }
    return result;
  }

  calcTotal(complete) {
    if (complete && this.calcTopHalve >= 63) {
      this.scores.bonus = 35;
    }

    let result = 0;
    for (let index in this.scores) {
      result += this.scores[index];
    }

    this.scores.total = result;
  }

  reset() {
    this.scores = {
      ones: null,
      twos: null,
      threes: null,
      fours: null,
      fives: null,
      sixes: null,
      bonus: 0,
      threeOfAKind: null,
      fourOfAKind: null,
      fullHouse: null,
      smallStraight: null,
      largeStraight: null,
      kniffel: null,
      chance: null,
      total: 0,
    };
  }
}
