export default class EventClass {
  constructor() {
    this.eventListeners = [];
  }

  addEventListener(type, eventHandler) {
    let listener = {};
    listener.type = type;
    listener.eventHandler = eventHandler;
    this.eventListeners.push(listener);
  }

  dispatchEvent(event, param) {
    for (let index in this.eventListeners) {
      if (event === this.eventListeners[index].type)
        this.eventListeners[index].eventHandler(param);
    }
  }
}
