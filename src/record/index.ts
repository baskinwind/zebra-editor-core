import Component from "../components/component";
import Block from "../components/block";
import updateComponent, { delayUpdate } from "../util/update-component";
import { getRecordStepId, recordSnapshoot } from "./util";

class Record {
  component: Component;
  recordMap: { [key: number]: any } = {};
  stepId: number = -1;

  constructor(component: Component) {
    this.component = component;
  }

  store() {
    let stepId = getRecordStepId();
    if (stepId === -1) return;
    if (!this.recordMap[stepId]) {
      recordSnapshoot(this.component);
    }
    this.recordMap[stepId] = this.component.snapshoot();
  }

  undo(stepId: number) {
    if (stepId === -1 || !this.recordMap[stepId]) return;
    if (this.stepId !== stepId) {
      this.stepId = stepId;
      this.component.restore(this.recordMap[stepId]);
    }
    if (this.component instanceof Block) {
      updateComponent(this.component);
    } else {
      delayUpdate([this.component.parent!.id]);
    }
  }

  redo(stepId: number) {
    if (stepId === -1 || !this.recordMap[stepId]) return;
    if (this.stepId !== stepId) {
      this.stepId = stepId;
      this.component.restore(this.recordMap[stepId]);
    }
    if (this.component instanceof Block) {
      updateComponent(this.component);
    } else {
      delayUpdate([this.component.parent!.id]);
    }
  }
}

export default Record;
