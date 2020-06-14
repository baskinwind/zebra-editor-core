import Component, { ISnapshoot } from "../components/component";
import Block from "../components/block";
import updateComponent, { delayUpdate } from "../util/update-component";
import { getRecordStepId, recordSnapshoot } from "./util";

class Record {
  component: Component;
  recordMap: { [key: number]: ISnapshoot } = {};
  stepId: number = -2;

  constructor(component: Component) {
    this.component = component;
  }

  store() {
    let stepId = getRecordStepId();
    if (stepId === -2) return;
    recordSnapshoot(this.component);
    this.recordMap[stepId] = this.component.snapshoot();
  }

  restore(stepId: number) {
    if (stepId === -2) return;
    let step = stepId;
    while (!this.recordMap[step] && step !== -1) {
      step--;
    }
    if (!this.recordMap[step]) return;
    this.component.restore(this.recordMap[step]);
    if (this.component instanceof Block) {
      updateComponent(this.component);
    } else {
      delayUpdate([this.component.parent!.id]);
    }
  }
}

export default Record;
