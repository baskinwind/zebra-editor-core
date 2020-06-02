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
  ): operatorType {
    let addIndex = typeof index === "number" ? index : this.children.size;
    this.children = this.children.splice(addIndex, 0, ...components);
    if (this.structureType === StructureType.content) {
      updateComponent(this, customerUpdate);
      return [this, addIndex + components.length, addIndex + components.length];
    }
    if (this.structureType === StructureType.collection) {
      updateComponent(components.reverse(), customerUpdate);
      return;
    }
  }

  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    let removeIndex: number;
    if (removeNumber < 0) {
      throw Error(`移除数量必须为自然数，不能小于 0：${removeNumber}`);
    }
    if (removeNumber === 0) return;
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

    let removedComponent = this.children.slice(
      removeIndex,
      removeIndex + removeNumber
    );
    removedComponent.forEach((component) => {
      component.actived = false;
      component.parent = undefined;
    });

    this.children = this.children.splice(removeIndex, removeNumber);
    if (this.structureType === StructureType.collection) {
      updateComponent(removedComponent.toArray(), customerUpdate);
      return;
    }
    if (this.structureType === StructureType.content) {
      updateComponent(this, customerUpdate);
      return [this, removeIndex, removeIndex];
    }
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): [Collection<T>, Collection<T>] | undefined {
    if (!this.parent) return;
    let tail = this.children.slice(index).toArray();
    this.removeChildren(index, this.children.size - index, customerUpdate);
    let newCollection = this.createEmpty();
    newCollection.addChildren(tail, 0, true);
    return [this, newCollection];
  };
}

export default Collection;
