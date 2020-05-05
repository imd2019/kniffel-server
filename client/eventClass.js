export default class Events {
  constructor() {
    this.evenListeners = [];
  }

  addEventListener(type, eventHandler) {
    let listener = {};
    listener.type = type;
    listener.eventHandler = eventHandler;
    this.eventListeners.push(listener);
  }

  dispatchEvent(event) {
    console.log(event);
    for (let index in this.eventListeners) {
      if (event.type == this.eventListeners[index].type)
        this.eventListeners[index].eventHandler(event);
    }
  }
}
