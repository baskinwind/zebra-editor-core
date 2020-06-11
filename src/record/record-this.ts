import Component, { operatorType } from "../components/component";
import Block from "../components/block";

const autoRecord = <T extends { new (...args: any[]): any }>(
  constructor: T
): T => {
  return class extends constructor {
    add(
      component: string | Component | Component[],
      index: number,
      customerUpdate: boolean = false
    ): operatorType {
      let res = super.add(component, index, customerUpdate);
      this.record.store();
      return res;
    }

    remove(
      start?: number,
      end?: number,
      customerUpdate: boolean = false
    ): operatorType {
      let res = super.remove(start, end, customerUpdate);
      this.record.store();
      return res;
    }

    split(
      index: number,
      block?: Block | Block[],
      customerUpdate: boolean = false
    ) {
      let res = super.split(index, block, customerUpdate);
      this.record.store();
      return res;
    }
  };
};

export default autoRecord;
