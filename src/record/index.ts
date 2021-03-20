import Component, { ISnapshoot } from "../components/component";

class Record {
  component: Component;
  recordMap: ISnapshoot[] = [];

  constructor(component: Component) {
    this.component = component;
    this.recordMap = [];
  }

  store(stepId: number) {
    this.recordMap[stepId] = this.component.snapshoot();
  }

  restore(stepId: number) {
    // 找到最近的一个节点解析更新
    while (!this.recordMap[stepId] && stepId !== -1) {
      stepId--;
    }
    if (stepId < 0) return;

    this.component.restore(this.recordMap[stepId]);
    this.component.$emit("componentChanged", [this.component]);
  }

  clear(stepId: number) {
    this.recordMap.splice(stepId);
  }
}

export default Record;
