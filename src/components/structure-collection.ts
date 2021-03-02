import { OperatorType, IRawType } from "./component";
import Block from "./block";
import Collection, { ICollectionSnapshoot } from "./collection";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { mergerStatistic } from "./util";
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

    if (index < 0) {
      throw createError("该组件不在子组件列表中", this);
    }
    return index;
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

  // TODO: 优化逻辑，直接用 article 取即可
  // 获取从 startId 到 endId 所包含的所有组件
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

  addChildren(component: T[], index?: number): T[] {
    index = index ? index : this.getSize();

    component.forEach((item) => {
      item.parent = this;
      item.active = true;
      item.recordSnapshoot();
    });

    let newBlock = super.addChildren(component, index);
    updateComponent(this.editor, [...component].reverse());
    return newBlock;
  }

  add(block: T | T[], index?: number): OperatorType {
    if (!Array.isArray(block)) {
      block = [block];
    }
    this.addChildren(block, index);
    return [block];
  }

  removeChildren(indexOrBlock: T | number, removeNumber: number = 1) {
    let removed = super.removeChildren(indexOrBlock, removeNumber);

    removed.forEach((item) => {
      item.active = false;
      item.parent = undefined;
      item.recordSnapshoot();
    });

    updateComponent(this.editor, removed);
    return removed;
  }

  remove(start: number, end: number = start + 1): OperatorType {
    if (end < 0) end = this.getSize() + end;

    if (start < 0 || start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    let removed = this.removeChildren(start, end - start);
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
    updateComponent(this.editor, [oldComponent, ...[...block].reverse()]);
    return block;
  }

  splitChild(index: number): StructureCollection<T> {
    if (index > this.getSize()) {
      throw createError("分割点不在列表内", this);
    }

    let tail = this.removeChildren(index, this.getSize() - index);
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
}

export default StructureCollection;
