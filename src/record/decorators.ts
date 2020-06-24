import Component from "../components/component";

const initRecordState = <T extends { new (...args: any[]): Component }>(
  constructor: T
) => {
  abstract class RecordComponent extends constructor {
    constructor(...args: any[]) {
      super(...args);
      this.recordSnapshoot();
    }
  }
  return RecordComponent;
};

const recordMethod = (
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => {
  let oldFunc = descriptor.value;
  descriptor.value = function (...args: any[]) {
    let res = oldFunc.call(this, ...args);
    if (target.recordSnapshoot) {
      target.recordSnapshoot.call(this);
    }
    return res;
  };
};

export { initRecordState, recordMethod };
