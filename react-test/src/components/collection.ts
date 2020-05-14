import { List } from "immutable";
import Component from "./component";
import BlockComponent from "./decorate-component";

export interface Operator {
  type: string;
  target: Component[];
  [key: string]: any;
}

export default abstract class Collection<
  T extends Component
> extends BlockComponent {
  children: List<T> = List();

  addChildren(component: T | T[], index?: number): Operator {
    let components: T[];
    if (!Array.isArray(component)) {
      components = [component];
    } else {
      components = component;
    }
    components.forEach((component, offset) => {
      component.parent = this;
      if (typeof index === "number" && index + offset <= this.children.size) {
        this.children = this.children.insert(index + offset, component);
      } else {
        this.children = this.children.push(component);
      }
    });
    return {
      type: "ADDCHILDREN",
      target: components,
      parent: this,
      index: index ? index : this.children.size - 1,
    };
  }

  removeChildren(componentOrIndex: T | number): Operator {
    let needRemoveComponent: T;
    let removeIndex: number;
    if (typeof componentOrIndex === "number") {
      let temp = this.children.get(componentOrIndex);
      if (!temp) throw Error("移除失败：index 不合法");
      needRemoveComponent = temp;
      removeIndex = componentOrIndex;
    } else {
      let temp = this.children.findIndex(
        (component) => component.id === componentOrIndex.id
      );
      if (temp === -1)
        throw Error("移除失败：该组件不在父组件列表内，移除失败");
      needRemoveComponent = componentOrIndex;
      removeIndex = temp;
    }
    this.children.remove(removeIndex);
    return {
      type: "REMOVECHILDREN",
      target: [needRemoveComponent],
      parent: this,
      index: removeIndex,
    };
  }

  findChildrenIndex(componentOrIndex: T): number {
    return this.children.findIndex(
      (component) => component.id === componentOrIndex.id
    );
  }
}
