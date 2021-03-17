import { OperatorType, IRawType } from "./component";
import Block from "./block";
import Collection, { ICollectionSnapshoot } from "./collection";
import StructureType from "../const/structure-type";
import { createError } from "../util/handle-error";

abstract class StructureCollection<
  T extends Block = Block
> extends Collection<T> {
  structureType = StructureType.structure;

  createEmpty(): StructureCollection<T> {
    throw createError("组件缺少 createEmpty 方法", this);
  }

  // 查找组件的位置
  findChildrenIndex(idOrBlock: string | Block): number {
    let blockId = typeof idOrBlock === "string" ? idOrBlock : idOrBlock.id;
    let index = this.children.findIndex((item) => item.id === blockId);
    return index;
  }

  addChildren(index: number, component: T[]): T[] {
    component.forEach((item) => {
      item.parent = this;
      item.active = true;
      item.recordSnapshoot();
    });

    let newBlockList = super.addChildren(index, component);
    this.$emit("componentUpdated", newBlockList);
    return newBlockList;
  }

  add(block: T | T[], index?: number): OperatorType {
    if (index === undefined) {
      index = this.getSize();
    }

    if (!Array.isArray(block)) {
      block = [block];
    }

    this.addChildren(index, block);
    return [block];
  }

  removeChildren(start: number, end: number = -1) {
    let removed = super.removeChildren(start, end);

    removed.forEach((item) => {
      item.active = false;
      item.parent = undefined;
      item.recordSnapshoot();
    });

    this.$emit("componentUpdated", removed);
    return removed;
  }

  remove(start: number, end: number = start + 1): OperatorType {
    if (start < 0) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    let removed = this.removeChildren(start, end);
    return [removed];
  }

  replaceChild(block: T[], oldComponent: T): Block[] {
    let index = this.findChildrenIndex(oldComponent);
    if (index === -1) {
      throw createError("替换组件不在子组件列表内", block);
    }

    oldComponent.active = false;
    oldComponent.parent = undefined;
    oldComponent.recordSnapshoot();
    block.forEach((item) => {
      item.parent = this;
      item.active = true;
      item.recordSnapshoot();
    });

    this.children = this.children.splice(index, 1, ...block);
    this.$emit("componentUpdated", [oldComponent, ...block]);
    return block;
  }

  splitChild(index: number): StructureCollection<T> {
    if (index > this.getSize()) {
      throw createError("分割点不在列表内", this);
    }

    let tail = this.removeChildren(index);
    let newCollection = this.createEmpty();
    newCollection.add(tail, 0);
    return newCollection;
  }

  split(index: number, block?: Block | Block[]): OperatorType {
    let parent = this.getParent();
    let componentIndex = parent.findChildrenIndex(this);
    let changedBlock = [];

    if (index !== 0) {
      let newCollection = this.splitChild(index);
      if (newCollection.getSize() !== 0) {
        changedBlock.push(newCollection);
        parent.add(newCollection, componentIndex + 1);
      }
    } else {
      componentIndex -= 1;
    }

    if (block) {
      if (!Array.isArray(block)) block = [block];
      changedBlock.push(...block);
      return parent.add(block, componentIndex + 1);
    }
    return [changedBlock];
  }

  // 定义当组件的子组件的首位发生删除时的行为，实现类需完善该逻辑
  childHeadDelete(block: T): OperatorType {
    return [[block]];
  }

  restore(state: ICollectionSnapshoot<T>) {
    this.children.forEach((item) => {
      if (item.parent === this) {
        item.active = false;
        item.parent = undefined;
      }
    });
    state.children.forEach((item) => {
      item.active = true;
      item.parent = this;
    });
    super.restore(state);
  }

  // 获取前一个组件
  getPrev(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);

    if (index === 0) {
      return;
    }
    return this.getChild(index - 1);
  }

  // 获取后一个组件
  getNext(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);

    if (index === this.getSize() - 1) {
      return;
    }
    return this.getChild(index + 1);
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.children = this.children.toArray().map((item) => item.getRaw());
    return raw;
  }
}

export default StructureCollection;
