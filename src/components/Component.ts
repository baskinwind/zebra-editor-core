import getId from "../util/getId";
import Entity from "./Entity";

export default abstract class Component {
  id: string = getId();
  entity: Entity;
  parent?: Component;
  children: Component[] = [];
  changeCall: Function[] = [];

  constructor(style?: Entity["style"], data?: Entity["data"]) {
    this.entity = new Entity(style, data);
  }

  postChange(event: any) {
    let parent: Component | undefined = this;
    while (parent) {
      if (parent.changeCall.length !== 0) {
        parent.changeCall.forEach((call) => call(event));
      }
      parent = parent.parent;
    }
  }

  findChildrenIndex(componentOrIndex: Component | number): number {
    if (typeof componentOrIndex === "number") return componentOrIndex;
    for (let i = 0; i < this.children?.length; i++) {
      if ((this.children[i].id = componentOrIndex.id)) {
        return i;
      }
    }
    return -1;
  }

  addChildren(component: Component, index?: number): number {
    this.postChange({ type: "ADDCHILDREN", target: this });
    if (this.children) this.children = [];
    if (index) {
      this.children?.splice(index, 0, component);
    } else {
      this.children?.push(component);
    }
    return index ? index : this.children.length - 1;
  }

  removeChildren(componentOrIndex: Component | number): number {
    this.postChange({ type: "REMOVECHILDREN", target: this });
    let removeIndex = this.findChildrenIndex(componentOrIndex);
    if (removeIndex >= 0) {
      this.children?.splice(removeIndex, 1);
    }
    return removeIndex;
  }

  addIntoParent(component: Component) {
    this.parent = component;
    this.parent.addChildren(this);
  }

  removeSelf() {
    this.parent?.removeChildren(this);
  }

  abstract getContent(): any;
}
