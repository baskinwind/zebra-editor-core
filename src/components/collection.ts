import { List } from "immutable";
import Component, { operatorType } from "./component";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";

abstract class Collection<T extends Component> extends Component {
  children: List<T> = List();

  isEmpty() {
    return this.children.size === 0;
  }

  addChildren(
    components: T[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    let addIndex = typeof index === "number" ? index : this.children.size;
    this.children = this.children.splice(addIndex, 0, ...components);
  }

  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): T[] {
    let removeIndex: number;
    if (removeNumber < 0) {
      throw Error(`移除数量必须为自然数，不能小于 0：${removeNumber}`);
    }
    if (removeNumber === 0) return [];
    if (typeof indexOrComponent === "number") {
      if (indexOrComponent < 0) {
        throw Error(`移除起始位置必须为自然数，不能小于 0：${removeNumber}`);
      }
      removeIndex = indexOrComponent;
    } else {
      let temp = this.children.findIndex(
        (component) => component.id === indexOrComponent.id
      );
      if (temp === -1) {
        throw Error("移除失败：该组件不在父组件列表内。");
      }
      removeIndex = temp;
    }

    let removedComponent = this.children
      .slice(removeIndex, removeIndex + removeNumber)
      .toArray();
    this.children = this.children.splice(removeIndex, removeNumber);
    return removedComponent;
  }
}

export default Collection;
