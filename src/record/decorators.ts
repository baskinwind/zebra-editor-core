import Record from ".";
import Component from "../components/component";

function recordComponent(constructor: typeof Component) {
  abstract class RecordComponent extends constructor {
    record: Record;
    constructor(...args: any[]) {
      super(...args);
      this.record = new Record(this);
      this.recordSnapshoot();
    };

    recordSnapshoot() {
      this.record.store();
    }
  };
  return RecordComponent;
}

const recordMethod = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  let oldFunc = descriptor.value;
  descriptor.value = function (...args: any[]) {
    let res = oldFunc.call(this, ...args);
    if (target.recordSnapshoot) {
      target.recordSnapshoot.call(this);
    }
    return res;
  };
};

export {
  recordComponent,
  recordMethod
};