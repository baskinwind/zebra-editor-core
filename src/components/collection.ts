import { List } from "immutable";
import Component from "./component";
import Block, { BlockSnapshoot } from "./block";
import { createError } from "../util";

export interface CollectionSnapshoot<T> extends BlockSnapshoot {
  children: List<T>;
}

abstract class Collection<T extends Component> extends Block {
  children: List<T> = List();

  addChildren(index: number, componentList: T[]): T[] {
    componentList.forEach((each) => {
      each.parent = this;
    });
    this.children = this.children.splice(index, 0, ...componentList);
    return componentList;
  }

  removeChildren(start: number, end: number = -1): T[] {
    if (start < 0) {
      throw createError(`error position start: ${start}`, this);
    }

    if (end < 0) {
      end = this.getSize() + 1 + end;
    }

    if (start > end) {
      throw createError(`error position start: ${start} end: ${end}.`, this);
    }

    let removedComponent = this.children.toArray().slice(start, end);

    removedComponent.forEach((each) => {
      each.parent = undefined;
    });

    this.children = this.children.splice(start, end - start);
    return removedComponent;
  }

  snapshoot(): CollectionSnapshoot<T> {
    let snap = super.snapshoot() as CollectionSnapshoot<T>;
    snap.children = this.children;
    return snap;
  }

  restore(state: CollectionSnapshoot<T>) {
    this.children = state.children;
    super.restore(state);
  }

  isEmpty(): boolean {
    return this.children.size === 0;
  }

  getChild(index: number): T {
    let child = this.children.get(index);
    if (!child) throw createError(`error child position index: ${index}`, this);
    return child;
  }

  getSize(): number {
    return this.children.size;
  }
}

export default Collection;
