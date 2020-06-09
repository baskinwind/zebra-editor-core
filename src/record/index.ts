import Component from "../components/component";
import StructureType from "../const/structure-type";
import updateComponent, { delayUpdate } from "../util/update-component";
import { recordState } from "./util";

class Record {
  component: Component;
  list: any[] = [];
  index: number = 0;

  constructor(component: Component) {
    this.component = component;
  }

  defaultStore() {
    let state = this.component.snapshoot();
    this.store(state);
  }

  store(state: any) {
    this.list.splice(this.index + 1);
    this.list.push(state);
    this.index = this.list.length - 1;
    recordState(this.component);
  }

  undo() {
    if (this.index === 0) return;
    this.index -= 1;
    this.component.restore(this.list[this.index]);
    if (this.component.structureType === StructureType.unit) {
      delayUpdate([this.component.parent!.id]);
    } else {
      updateComponent(this.component);
    }
  }

  redo() {
    if (this.index === this.list.length) return;
    this.index += 1;
    this.component.restore(this.list[this.index]);
    if (this.component.structureType === StructureType.unit) {
      delayUpdate([this.component.parent!.id]);
    } else {
      updateComponent(this.component);
    }
  }
}

export default Record;
