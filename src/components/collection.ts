import { List } from "immutable";
import Component from "./component";
import { storeData } from "../decorate";
import updateComponent from "../util/update-component";
import { createError } from "./util";

abstract class Collection<T extends Component> extends Component {
  children: List<T> = List();

  isEmpty() {
    return this.children.size === 0;
  }

  // 内部使用，添加子元素
  addChildren(
    components: T[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    let addIndex = typeof index === "number" ? index : this.children.size;
    this.children = this.children.splice(addIndex, 0, ...components);
  }

  // 内部使用，移除子元素
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

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): Collection<T> | undefined {
    throw createError("组件未实现 splitChild 方法", this);
  }

  replaceChild(component: T, oldComponent: T, customerUpdate: boolean = false) {
    throw createError("组件未实现 replaceChild 方法", this);
  }

  findChildrenIndex(idOrComponent: string | Component): number {
    throw createError("组件未实现 findChildrenIndex 方法", this);
  }

  getPrev(idOrComponent: string | T): T | undefined {
    throw createError("组件未实现 getPrev 方法", this);
  }

  getNext(idOrComponent: string | T): T | undefined {
    throw createError("组件未实现 getNext 方法", this);
  }

  getIdList(startId?: string, endId?: string): [boolean, boolean, string[]] {
    throw createError("组件未实现 getIdList 方法", this);
  }
}

export default Collection;
