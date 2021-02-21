import Component, { ISnapshoot } from "../components/component";
import Block from "../components/block";
import { delayUpdate } from "../util/update-component";

class Record {
  component: Component;
  recordMap: ISnapshoot[] = [];

  constructor(component: Component) {
    this.component = component;
  }

  init() {
    this.recordMap = [];
  }

  store(stepId: number) {
    if (stepId === -1) return;
    this.recordMap[stepId] = this.component.snapshoot();
  }

  restore(stepId: number) {
    if (stepId === -1) return;
    let step = stepId;
    while (!this.recordMap[step] && step !== -1) {
      step--;
    }
    if (stepId === -1) return;

    this.component.restore(this.recordMap[step]);
    if (this.component instanceof Block) {
      delayUpdate(this.component.id);
    } else {
      delayUpdate(this.component.parent!.id);
    }
  }

  clear(index: number) {
    this.recordMap.splice(index);
  }
}

export default Record;
