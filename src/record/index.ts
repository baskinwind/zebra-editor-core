import Component from "../components/component";
import Block from "../components/block";
import updateComponent, { delayUpdate } from "../util/update-component";
import { getRecordStatus, recordSnapshoot } from "./util";

class Record {
  component: Component;
  list: any[] = [];
  index: number = -1;
  stepId: number = -1;

  constructor(component: Component) {
    this.component = component;
  }

  store() {
    if (!getRecordStatus()) return;
    let state = this.component.snapshoot();
    this.list.splice(this.index + 1);
    this.list.push(state);
    this.index = this.list.length - 1;
    recordSnapshoot(this.component);
  }

  undo(stepId: number) {
    if (this.index <= 0) return;
    if (this.stepId !== stepId) {
      this.component.restore(this.list[this.index - 1]);
      this.stepId = stepId;
      this.index -= 1;
    }
    if (this.component instanceof Block) {
      updateComponent(this.component);
    } else {
      delayUpdate([this.component.parent!.id]);
    }
  }

  redo(stepId: number) {
    if (this.index >= this.list.length - 1) return;
    if (this.stepId !== stepId) {
      this.component.restore(this.list[this.index + 1]);
      this.stepId = stepId;
      this.index += 1;
    }
    if (this.component instanceof Block) {
      updateComponent(this.component);
    } else {
      delayUpdate([this.component.parent!.id]);
    }
  }
}

export default Record;
