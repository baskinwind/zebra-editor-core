import { List } from "immutable";
import Component from "./component";
import Block, { IBlockSnapshoot } from "./block";
import { createError } from "../util/handle-error";

export interface ICollectionSnapshoot<T> extends IBlockSnapshoot {
  children: List<T>;
}

abstract class Collection<T extends Component> extends Block {
  children: List<T> = List();

  // 内部使用，添加子元素
  addChildren(index: number, components: T[]): T[] {
    components.forEach((item) => {
      item.parent = this;
    });
    this.children = this.children.splice(index, 0, ...components);
    return components;
  }

  // 内部使用，移除子元素
  removeChildren(start: number, end: number = 0): T[] {
    if (start < 0) {
      throw createError(`移除起始位置不能小于 0：${start}`, this);
    }

    if (end < 1) {
      end = this.getSize() + end;
    }

    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    let removedComponent = this.children.slice(start, end).toArray();

    removedComponent.forEach((item) => {
      item.parent = undefined;
    });

    this.children = this.children.splice(start, end - start);
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

  destory() {
    this.children.forEach((item) => item.destory());
    this.children = List();
    super.destory();
  }
}

export default Collection;
