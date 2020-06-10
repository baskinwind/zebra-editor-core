import { List } from "immutable";
import Component from "./component";
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
        (component) => component.id === indexOrComponent.id
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

  // 将组件从 index 分成两个同类型的组件
  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): Collection<T> | undefined {
    throw createError("组件缺少 splitChild 方法", this);
  }

  // 替换子组件
  replaceChild(
    component: T[],
    oldComponent: T,
    customerUpdate: boolean = false
  ) {
    throw createError("组件缺少 replaceChild 方法", this);
  }

  // 获得子组件的位置
  findChildrenIndex(idOrComponent: string | Component): number {
    throw createError("组件缺少 findChildrenIndex 方法", this);
  }

  // 获取前一个子组件
  getPrev(idOrComponent: string | T): T | undefined {
    throw createError("组件缺少 getPrev 方法", this);
  }

  // 获取下一个子组件
  getNext(idOrComponent: string | T): T | undefined {
    throw createError("组件缺少 getNext 方法", this);
  }

  // 获取从 startId 到 endId 中所有的组件 id
  getIdList(startId?: string, endId?: string): [boolean, boolean, string[]] {
    throw createError("组件缺少 getIdList 方法", this);
  }
}

export default Collection;
