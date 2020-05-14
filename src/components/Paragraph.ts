import Component from "./Component";
import Entity from "./Entity";
import { getBuilder } from "../builder";

export default class Paragraph extends Component {
  childrenEntitys: Entity[][] = [];

  addChildren(component: Component, index?: number): number {
    let addIndex = super.addChildren(component, index);
    if (index) {
      this.childrenEntitys?.splice(index, 0, []);
    } else {
      this.childrenEntitys?.push([]);
    }
    return addIndex;
  }

  removeChildren(componentOrIndex: Component | number): number {
    let removeIndex = super.removeChildren(componentOrIndex);
    if (removeIndex >= 0) {
      this.childrenEntitys?.splice(removeIndex, 1);
    }
    return removeIndex;
  }

  getContent() {
    const builder = getBuilder();
    let children = this.children?.map((inline) => inline.getContent());
    let content = [];
    let acc = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === "CHARACTER") {
        acc.push(child);
        continue;
      }
      if (acc.length !== 0) {
        content.push(builder.buildCharacterList(acc, {}, {}));
        acc = [];
      }
      content.push(child);
    }
    return content;
  }
}
