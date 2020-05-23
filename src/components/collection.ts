import { List } from "immutable";
import Component, { Operator } from "./ccomponent";
import BlockComponent from "./decorate-component";
import ComponentType from "../const/component-type";

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
    components.forEach((component) => (component.parent = this));
    if (typeof index === "number") {
      this.children = this.children.splice(index, 0, ...components);
    } else {
      this.children = this.children.push(...components);
    }
    let start = typeof index === "number" ? index : this.children.size - 1;
    return {
      type: `ADDCHILDREN:${this.type}`,
      target: components,
      action: this,
      start,
      end: start + components.length,
    };
  }

  removeChildren(
    componentOrIndex: T | number,
    removeNumber: number = 1,
    tiggerBy: string = "customer"
  ): Operator<T> {
    let removeIndex: number;
    if (removeNumber === 0) {
      return {
        type: `REMOVECHILDREN:${this.type}`,
        target: [],
        action: this,
        start: -1,
        end: -1,
      };
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
    return {
      type: `REMOVECHILDREN:${this.type}`,
      target: removedComponent.toArray(),
      action: this,
      tiggerBy,
      start: removeIndex,
      end: removeIndex + removedComponent.size,
    };
  }

  findChildrenIndex(componentOrIndex: T): number {
    return this.children.findIndex(
      (component) => component.id === componentOrIndex.id
    );
  }

  getIdList(...ids: [string, string]) {
    let res: string[] = [];
    if (ids[0] === ids[1]) {
      return [ids[0]];
    }
    let flag = false;
    this.children.forEach((component) => {
      if (ids.includes(component.id)) {
        res.push(component.id);
        flag = !flag;
        return;
      }
      if (flag) {
        res.push(component.id);
      }
    });
    return res;
  }
}
