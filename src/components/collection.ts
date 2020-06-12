import { List } from "immutable";
import Component from "./component";
import Block from "./block";
import { createError } from "./util";
import { recordMethod } from "../record/decorators";
import { storeData } from "../decorate";

abstract class Collection<T extends Component> extends Block {
  children: List<T> = List();

  isEmpty(): boolean {
    return this.children.size === 0;
  }

  getSize(): number {
    return this.children.size;
  }

  // 内部使用，添加子元素
  @recordMethod
  addChildren(
    components: T[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    let addIndex = typeof index === "number" ? index : this.getSize();
    this.children = this.children.splice(addIndex, 0, ...components);
  }

  // 内部使用，移除子元素
  @recordMethod
  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): T[] {
    let removeIndex: number;
    if (removeNumber < 0) {
      throw createError(`移除数量不能小于 0：${removeNumber}`, this);
    }
    if (removeNumber === 0) return [];
    if (typeof indexOrComponent === "number") {
      if (indexOrComponent < 0) {
        throw createError(`移除起始位置不能小于 0：${removeNumber}`, this);
      }
      removeIndex = indexOrComponent;
    } else {
      let temp = this.children.findIndex(
        (item) => item.id === indexOrComponent.id
      );
      if (temp === -1) {
        throw createError("移除组件不在列表内。");
      }
      removeIndex = temp;
    }

    let removedComponent = this.children
      .slice(removeIndex, removeIndex + removeNumber)
      .toArray();
    this.children = this.children.splice(removeIndex, removeNumber);
    return removedComponent;
  }

  snapshoot(): any {
    return {
      children: this.children,
      style: this.decorate.style,
      data: this.decorate.data
    };
  }

  restore(state?: any) {
    this.children = state.children;
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }
}

export default Collection;
