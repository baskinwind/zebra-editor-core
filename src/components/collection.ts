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
  addChildren(index: number, componentList: T[]): T[] {
    componentList.forEach((each) => {
      each.parent = this;
    });
    this.children = this.children.splice(index, 0, ...componentList);
    return componentList;
  }

  // 内部使用，移除子元素
  removeChildren(start: number, end: number = -1): T[] {
    if (start < 0) {
      throw createError(`移除起始位置不能小于 0：${start}`, this);
    }

    if (end < 0) {
      end = this.getSize() + 1 + end;
    }

    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    let removedComponent = this.children.toArray().slice(start, end);

    removedComponent.forEach((each) => {
      each.parent = undefined;
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
}

export default Collection;
