import { List } from "immutable";
import Component from "./component";
import BlockComponent from "./decorate-component";

export interface Operator {
  type: string; // 操作类型
  target: Component[]; // 操作新增或是删除的组件
  action: Component; // 操作发生的组件
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
      action: this,
      index: index ? index : this.children.size - 1,
    };
  }

  removeChildren(
    componentOrIndex: T | number,
    removeNumber: number = 1
  ): Operator {
    let removeIndex: number;

    if (typeof componentOrIndex === "number") {
      let temp = this.children.get(componentOrIndex);
      if (!temp) throw Error("移除失败：index 不合法");
      removeIndex = componentOrIndex;
    } else {
      let temp = this.children.findIndex(
        (component) => component.id === componentOrIndex.id
      );
      if (temp === -1)
        throw Error("移除失败：该组件不在父组件列表内，移除失败");
      removeIndex = temp;
    }
    if (removeNumber < 0) {
      removeNumber = this.children.size - removeIndex;
    }
    let removedComponent = this.children.slice(
      removeIndex,
      removeIndex + removeNumber
    );
    this.children = this.children.splice(removeIndex, removeNumber);
    return {
      type: "REMOVECHILDREN",
      target: removedComponent.toArray(),
      action: this,
      index: removeIndex,
    };
  }

  findChildrenIndex(componentOrIndex: T): number {
    return this.children.findIndex(
      (component) => component.id === componentOrIndex.id
    );
  }
}
