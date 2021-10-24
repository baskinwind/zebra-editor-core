import { OperatorType, JSONType } from "./component";
import Block from "./block";
import Collection, { CollectionSnapshoot } from "./collection";
import StructureType from "../const/structure-type";
import { createError } from "../util/handle-error";

abstract class StructureCollection<T extends Block> extends Collection<T> {
  structureType = StructureType.structure;

  createEmpty(): StructureCollection<T> {
    throw createError("component need implement createEmpty method", this);
  }

  findChildrenIndex(idOrBlock: string | Block): number {
    let blockId = typeof idOrBlock === "string" ? idOrBlock : idOrBlock.id;
    let index = this.children.findIndex((each) => each.id === blockId);
    return index;
  }

  addChildren(index: number, componentList: T[]): T[] {
    componentList.forEach((each) => {
      each.parent = this;
      each.active = true;
      each.$emit("blockCreated", each);
    });
    this.componentWillChange();
    let newBlockList = super.addChildren(index, componentList);
    this.updateComponent([...newBlockList, this]);
    return newBlockList;
  }

  add(index: number, ...blockList: T[]): OperatorType {
    index = index < 0 ? this.getSize() + 1 + index : index;
    this.addChildren(index, blockList);
    return;
  }

  removeChildren(start: number, end: number = -1) {
    this.componentWillChange();
    let removed = super.removeChildren(start, end);

    removed.forEach((each) => each.destory());

    this.updateComponent([...removed, this]);

    if (this.getSize() === 0) {
      this.removeSelf();
    }

    return removed;
  }

  remove(start: number, end: number = start + 1): OperatorType {
    if (start < 0) {
      throw createError(`error position start: ${start} end: ${end}.`, this);
    }

    this.removeChildren(start, end);
    return;
  }

  replaceChild(blockList: T[], oldComponent: T): Block[] {
    let index = this.findChildrenIndex(oldComponent);
    if (index === -1) {
      throw createError(`cannot replace child at ${index}`, blockList);
    }
    oldComponent.destory();

    blockList.forEach((each) => {
      each.parent = this;
      each.active = true;
    });

    this.componentWillChange();
    this.children = this.children.splice(index, 1, ...blockList);
    this.updateComponent([oldComponent, ...blockList, this]);
    return blockList;
  }

  splitChild(index: number): StructureCollection<T> {
    if (index > this.getSize()) {
      throw createError(`cannot split child at ${index}`, this);
    }

    let tail = this.removeChildren(index);
    let newCollection = this.createEmpty();
    newCollection.add(0, ...tail);
    return newCollection;
  }

  split(index: number, ...blockList: Block[]): OperatorType {
    let parent = this.getParent();
    let componentIndex = parent.findChildrenIndex(this);
    let changedBlock = [];

    if (index !== 0) {
      let newCollection = this.splitChild(index);
      if (newCollection.getSize() !== 0) {
        changedBlock.push(newCollection);
        parent.add(componentIndex + 1, newCollection);
      }
    } else {
      componentIndex -= 1;
    }

    if (blockList.length) {
      changedBlock.push(...blockList);
      return parent.add(componentIndex + 1, ...blockList);
    }

    return;
  }

  childHeadDelete(block: T): OperatorType {
    return;
  }

  restore(state: CollectionSnapshoot<T>) {
    this.children.forEach((each) => {
      if (each.parent === this) {
        each.active = false;
        each.parent = undefined;
      }
    });
    state.children.forEach((each) => {
      each.active = true;
      each.parent = this;
    });
    super.restore(state);
  }

  getPrev(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);

    if (index === 0) {
      return;
    }
    return this.getChild(index - 1);
  }

  getNext(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);

    if (index === this.getSize() - 1) {
      return;
    }
    return this.getChild(index + 1);
  }

  getJSON(): JSONType {
    let json = super.getJSON();
    json.children = this.children.toArray().map((each) => each.getJSON());
    return json;
  }

  destory() {
    this.children.forEach((each) => each.destory());
    super.destory();
  }
}

export default StructureCollection;
