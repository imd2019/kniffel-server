export default class Player {
  constructor(socketId) {
    this.socketId = socketId;
  }
  getName() {
    return SOCKET_LIST[this.socketId].name;
  }
}
