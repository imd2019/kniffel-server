export default class EventDispatcher {
  constructor() {
    this.listeners = {};
  }

  addEventListener(type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  removeEventListener(type, callback) {
    if (!(type in this.listeners)) {
      return;
    }
    for (let i in this.listeners[type]) {
      if (this.listeners[type][i] === callback) {
        this.listeners[type].splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent(event) {
    if (!(event.type in this.listeners)) {
      return true;
    }
    for (let elem of this.listeners[event.type]) {
      elem.call(this, event);
    }
    return !event.defaultPrevented;
  }
}
