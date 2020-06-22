import { operatorType, IRawType } from "./component";
import Block from "./block";
import Collection, { ICollectionSnapshoot } from "./collection";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { createError, mergerStatistic } from "./util";
import { recordMethod } from "../record/decorators";

abstract class StructureCollection<T extends Block = Block> extends Collection<
  T
> {
  structureType = StructureType.structure;

  createEmpty(): StructureCollection<T> {
    throw createError("组件缺少 createEmpty 方法", this);
  }

  addChildren(component: T[], index?: number, customerUpdate: boolean = false) {
    component.forEach((item) => {
      item.parent = this;
      item.active = true;
    });
    super.addChildren(component, index);
    updateComponent([...component].reverse(), customerUpdate);
  }

  removeChildren(
    indexOrBlock: T | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(indexOrBlock, removeNumber);
    removed.forEach((component) => {
      component.active = false;
      component.parent = undefined;
    });
    updateComponent(removed, customerUpdate);
    return removed;
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

  @recordMethod
  replaceChild(block: T[], oldComponent: T, customerUpdate: boolean = false) {
    let index = this.findChildrenIndex(oldComponent);
    if (index === -1) {
      throw createError("替换组件不在子组件列表内", block);
    }
    block.forEach((item) => {
      item.parent = this;
      item.active = true;
    });
    oldComponent.active = false;
    oldComponent.parent = undefined;
    this.children = this.children.splice(index, 1, ...block);
    updateComponent([oldComponent, ...[...block].reverse()], customerUpdate);
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): StructureCollection<T> | undefined {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    if (index >= this.getSize()) return;
    let tail = this.children.slice(index).toArray();
    let thisIndex = parent.findChildrenIndex(this);
    this.removeChildren(index, this.getSize() - index, customerUpdate);
    let newCollection = this.createEmpty();
    newCollection.addChildren(tail, 0, true);
    if (!this.active) {
      thisIndex -= 1;
    }
    parent.addChildren([newCollection], thisIndex + 1);
    return newCollection;
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let componentIndex = parent.findChildrenIndex(this);
    if (index !== 0) {
      this.splitChild(index, customerUpdate);
    } else {
      componentIndex -= 1;
    }
    if (this.isEmpty()) {
      this.removeSelf();
      componentIndex -= 1;
    }
    if (block) {
      if (!Array.isArray(block)) block = [block];
      parent.addChildren(block, componentIndex + 1, customerUpdate);
      return [block[0], 0, 0];
    }
    return;
  }

  findChildrenIndex(idOrBlock: string | Block): number {
    let id = typeof idOrBlock === "string" ? idOrBlock : idOrBlock.id;
    let index = this.children.findIndex((item) => item.id === id);
    if (index < 0) throw createError("该组件不在子组件列表中");
    return index;
  }

  getPrev(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);
    if (index === 0) return;
    return this.children.get(index - 1);
  }

  getNext(idOrBlock: string | T): T | undefined {
    let index = this.findChildrenIndex(idOrBlock);
    if (index === this.getSize()) return;
    return this.children.get(index + 1);
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

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.children = this.children.toArray().map((item) => item.getRaw());
    return raw;
  }

  getStatistic() {
    let res = super.getStatistic();
    this.children.forEach((item) => {
      res = mergerStatistic(res, item.getStatistic());
    });
    return res;
  }
}

export default StructureCollection;
