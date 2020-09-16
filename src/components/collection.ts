import { List } from "immutable";
import Component from "./component";
import Block, { IBlockSnapshoot } from "./block";
import { recordMethod } from "../record/decorators";
import { createError } from "../util/handle-error";

export interface ICollectionSnapshoot<T> extends IBlockSnapshoot {
  children: List<T>;
}

abstract class Collection<T extends Component> extends Block {
  children: List<T> = List();

  isEmpty(): boolean {
    return this.children.size === 0;
  }

  getChild(index: number): T {
    let child = this.children.get(index);
    if (!child) throw createError(`未找到${index}位置的子组件`, this);
    return child;
  }

  getSize(): number {
    return this.children.size;
  }

  // 内部使用，添加子元素
  @recordMethod
  addChildren(
    components: T[],
    index?: number,
    customerUpdate: boolean = false,
  ): T[] {
    let addIndex = typeof index === "number" ? index : this.getSize();
    this.children = this.children.splice(addIndex, 0, ...components);
    return components;
  }

  // 内部使用，移除子元素
  @recordMethod
  removeChildren(
    indexOrComponent: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false,
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
        (item) => item.id === indexOrComponent.id,
      );
      if (temp === -1) {
        throw createError("移除组件不在列表内。", this);
      }
      removeIndex = temp;
    }

    let removedComponent = this.children
      .slice(removeIndex, removeIndex + removeNumber)
      .toArray();
    this.children = this.children.splice(removeIndex, removeNumber);
    return removedComponent;
  }

  snapshoot(): ICollectionSnapshoot<T> {
    let snap = super.snapshoot() as ICollectionSnapshoot<T>;
    snap.children = this.children;
    return snap;
  }

  restore(state: ICollectionSnapshoot<T>) {
    this.children = state.children;
    super.restore(state);
  }
}

export default Collection;
