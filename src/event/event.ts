interface eventGroupType {
  [eventName: string]: Function[];
}

let uid = 0;

export default class Event {
  id: number = uid++;
  _events: eventGroupType = {};

  $on<T>(eventName: string, fn: (event: T, ...rest: any[]) => void): this {
    if (!this._events[eventName]) {
      this._events[eventName] = [];
    }
    if (this._events[eventName].filter((func) => func === fn).length === 0) {
      this._events[eventName].push(fn);
    }
    return this;
  }

  $off(eventName: string, fn: Function) {
    // 清空所有事件
    if (!arguments.length) {
      this._events = {};
      return this;
    }
    // 若没有事件对应的函数列表则不用处理
    const cbs = this._events[eventName];
    if (!cbs) {
      return this;
    }
    // 清空特定事件
    if (!fn) {
      this._events[eventName] = [];
      return this;
    }
    // 取消特定事件的特定处理函数
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
