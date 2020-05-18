import { List } from "immutable";
import Component, { Operator } from "./component";
import BlockComponent from "./decorate-component";
import ComponentType from "../const/component-type";

export default abstract class Collection<
  T extends Component
> extends BlockComponent {
  children: List<T> = List();

  addChildren(
    component: T | T[],
    index?: number,
    tiggerBy: string = "customer"
  ): Operator {
    console.log(index);

    let components: T[];
    if (!Array.isArray(component)) {
      components = [component];
    } else {
      components = component;
    }
    components.forEach((component) => (component.parent = this));
    if (typeof index === "number") {
      this.children = this.children.splice(index, 0, ...components);
    } else {
      this.children = this.children.push(...components);
    }
    let event = {
      type: `ADDCHILDREN:${this.type}`,
      target: components,
      action: this,
      index: typeof index === "number" ? index : this.children.size - 1,
      tiggerBy,
    };
    if (this.type !== ComponentType.paragraph) {
      this.update(event);
    }
    return event;
  }

  removeChildren(
    componentOrIndex: T | number,
    removeNumber: number = 1,
    tiggerBy: string = "customer"
  ): Operator<T> {
    let removeIndex: number;
    if (removeNumber === 0) {
      let event = {
        type: `REMOVECHILDREN:${this.type}`,
        target: [],
        action: this,
        index: -1,
        tiggerBy,
      };
      this.update(event);
      return event;
    }
    if (typeof componentOrIndex === "number") {
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
    let event = {
      type: `REMOVECHILDREN:${this.type}`,
      target: removedComponent.toArray(),
      action: this,
      index: removeIndex,
      tiggerBy,
    };
    if (this.type !== ComponentType.paragraph) {
      this.update(event);
    }
    return event;
  }

  findChildrenIndex(componentOrIndex: T): number {
    return this.children.findIndex(
      (component) => component.id === componentOrIndex.id
    );
  }
}
