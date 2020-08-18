import { operatorType, IRawType } from "./component";
import Block from "./block";
import Collection, { ICollectionSnapshoot } from "./collection";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { mergerStatistic } from "./util";
import { recordMethod } from "../record/decorators";
import { createError } from "../util/handle-error";

abstract class StructureCollection<T extends Block = Block> extends Collection<
  T
> {
  structureType = StructureType.structure;

  createEmpty(): StructureCollection<T> {
    throw createError("组件缺少 createEmpty 方法", this);
  }

  findChildrenIndex(idOrBlock: string | Block): number {
    let id = typeof idOrBlock === "string" ? idOrBlock : idOrBlock.id;
    let index = this.children.findIndex((item) => item.id === id);
    if (index < 0) throw createError("该组件不在子组件列表中", this);
    return index;
  }

  getPrev(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);
    if (index === 0) return;
    return this.getChild(index - 1);
  }

  getNext(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);
    if (index === this.getSize() - 1) return;
    return this.getChild(index + 1);
  }

  getIdList(startId?: string, endId?: string): [boolean, boolean, string[]] {
    if (!this.active) return [false, false, []];
    if (!endId) {
      endId = startId;
    }
    let res: string[] = [];
    let startFlag = false;
    let endFlag = false;

    this.children.forEach((item) => {
      if (endFlag) return;
      if (item instanceof StructureCollection) {
        let temp = item.getIdList(startFlag ? "" : startId, endId);
        startFlag = startFlag || temp[0];
        endFlag = endFlag || temp[1];
        res.push(...temp[2]);
        return;
      }
      if (item.id === startId || startId === "") {
        res.push(item.id);
        startFlag = true;
        if (item.id === endId) {
          endFlag = true;
        }
        return;
      }
      if (item.id === endId) {
        res.push(item.id);
        endFlag = true;
        return;
      }
      if (startFlag && !endFlag) {
        res.push(item.id);
      }
    });
    // [是否已找到 startId, 是否已找到 endId, 在范围内的 Id]
    return [startFlag, endFlag, res];
  }

  getStatistic() {
    let res = super.getStatistic();
    this.children.forEach((item) => {
      res = mergerStatistic(res, item.getStatistic());
    });
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.children = this.children.toArray().map((item) => item.getRaw());
    return raw;
  }

  addChildren(
    component: T[],
    index?: number,
    customerUpdate: boolean = false
  ): T[] {
    component.forEach((item) => {
      item.parent = this;
      item.active = true;
      item.recordSnapshoot();
    });
    let newBlock = super.addChildren(component, index);
    updateComponent([...component].reverse(), customerUpdate);
    return newBlock;
  }

  add(
    block: T | T[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(block)) {
      block = [block];
    }
    this.addChildren(block, index, customerUpdate);
    return [block[0], 0, 0];
  }

  removeChildren(
    indexOrBlock: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(indexOrBlock, removeNumber);
    removed.forEach((item) => {
      item.active = false;
      item.parent = undefined;
      item.recordSnapshoot();
    });
    updateComponent(removed, customerUpdate);
    return removed;
  }

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (end === undefined) end = this.getSize();
    if (start < 0 || start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
    this.removeChildren(start, end - start, customerUpdate);
    return [this, start, start];
  }

  @recordMethod
  replaceChild(
    block: T[],
    oldComponent: T,
    customerUpdate: boolean = false
  ): Block[] {
    let index = this.findChildrenIndex(oldComponent);
    if (index === -1) {
      throw createError("替换组件不在子组件列表内", block);
    }
    oldComponent.active = false;
    oldComponent.parent = undefined;
    block.forEach((item) => {
      item.parent = this;
      item.active = true;
    });
    this.children = this.children.splice(index, 1, ...block);
    updateComponent([oldComponent, ...[...block].reverse()], customerUpdate);
    return block;
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): StructureCollection<T> {
    if (index > this.getSize()) throw createError("分割点不在列表内", this);

    let tail = this.removeChildren(
      index,
      this.getSize() - index,
      customerUpdate
    );
    let newCollection = this.createEmpty();
    newCollection.add(tail, 0, true);
    return newCollection;
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    let componentIndex = parent.findChildrenIndex(this);
    if (index !== 0) {
      let newCollection = this.splitChild(index, customerUpdate);
      if (newCollection.getSize() !== 0) {
        parent.add(newCollection, componentIndex + 1, customerUpdate);
      }
    } else {
      componentIndex -= 1;
    }
    if (block) {
      if (!Array.isArray(block)) block = [block];
      return parent.add(block, componentIndex + 1, customerUpdate);
    }
    return;
  }

  // 定义当组件的子组件的首位发生删除时的行为
  // 默认不处理，而不是报错
  childHeadDelete(
    component: T,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  restore(state: ICollectionSnapshoot<T>) {
    this.children.forEach((item) => {
      item.active = false;
      item.parent = undefined;
    });
    state.children.forEach((item) => {
      item.active = true;
      item.parent = this;
    });
    super.restore(state);
  }
}

export default StructureCollection;
