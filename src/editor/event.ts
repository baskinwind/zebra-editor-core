interface EventGroup {
  [eventName: string]: Function[];
}

export default class Event {
  _events: EventGroup = {};

  $on<T>(eventName: string, fn: (event: T, ...rest: any[]) => void): this {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    this._events[eventName].push(fn);
    return this;
  }

  $off(eventName?: string, fn?: Function) {
    if (!eventName) {
      this._events = {};
      return this;
    }
    const cbs = this._events[eventName];
    if (!cbs) {
      return this;
    }
    if (!fn) {
      this._events[eventName] = [];
      return this;
    }
    if (fn) {
      let cb;
      let i = cbs.length;
      while (i--) {
        cb = cbs[i];
        // @ts-ignore
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break;
        }
      }
    }
    return this;
  }

  $emit<T>(eventName: string, event?: T, ...rest: any[]) {
    let cbs = this._events[eventName];
    if (cbs) {
      cbs.forEach((func) => func.call(this, event, ...rest));
    }
    return this;
  }
}
