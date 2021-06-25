export default class EventDispatcher {
  constructor () {
    this.listeners = {};
  }

  addEventListener (type, callback) {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(callback);
  }

  removeEventListener (type, callback) {
    if (!(type in this.listeners)) {
      return;
    }
    const keys = Object.keys(this.listeners[type]);
    for (let i = 0; i < keys.length; i++) {
      if (this.listeners[type][i] === callback) {
        this.listeners[type].splice(i, 1);
        return;
      }
    }
  }

  dispatchEvent (event) {
    if (!(event.type in this.listeners)) {
      return true;
    }
    this.listeners[event.type].forEach((elem) => {
      elem.call(this.addEventListener, event);
    });
    return !event.defaultPrevented;
  }
}
