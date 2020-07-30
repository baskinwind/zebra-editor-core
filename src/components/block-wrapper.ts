import { List } from "immutable";
import { operatorType } from "./component";
import StructureCollection from "./structure-collection";
import Block from "./block";
import ComponentBlockype from "../const/component-type";
import { storeData } from "../decorate";
import { getContentBuilder } from "../content";
import { createError } from "../util/handle-error";

abstract class BlockWrapper extends StructureCollection<Block> {
  type = ComponentBlockype.blockWrapper;

  constructor(block: Block, style?: storeData, data?: storeData) {
    super(style, data);
    if (!block) {
      throw createError("BlockWrapper 组件必须拥有一个子组件", block);
    }
    this.children = List([block]);
    block.parent = this;
    block.active = true;
  }

  isEmpty(): boolean {
    return this.getChild().isEmpty();
  }

  getSize(): number {
    let parent = this.getParent();
    return parent.getSize();
  }

  getChild(index?: number): Block {
    let child = this.children.get(0);
    if (!child) throw createError("子组件获取失败", this);
    return child;
  }

  getRealParent() {
    return this.getParent();
  }

  getPrev(idOrBlock: string | Block): Block | undefined {
    let parent = this.getParent();
    let prev = parent.getPrev(this);
    if (prev instanceof BlockWrapper) {
      return prev.getChild();
    }
    return prev;
  }

  getNext(idOrBlock: string | Block): Block | undefined {
    let parent = this.getParent();
    let next = parent.getNext(this);
    if (next instanceof BlockWrapper) {
      return next.getChild();
    }
    return next;
  }

  findChildrenIndex(idOrBlock: string | Block): number {
    let parent = this.getParent();
    return parent.findChildrenIndex(this);
  }

  addChildren(
    component: Block[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    let parent = this.getParent();
    return parent.addChildren(component, index, customerUpdate);
  }

  add(
    block: Block | Block[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    return parent.add(block, index, customerUpdate);
  }

  addEmptyParagraph(bottom: boolean): operatorType {
    let parent = this.getParent();
    return parent.addEmptyParagraph(bottom);
  }

  removeChildren(
    indexOrBlock: Block | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    let parent = this.parent;
    if (!parent) return [];
    if (typeof indexOrBlock !== "number") {
      indexOrBlock = indexOrBlock.getParent().findChildrenIndex(indexOrBlock);
    }
    return parent.removeChildren(indexOrBlock, removeNumber, customerUpdate);
  }

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) return;
    return parent.remove(start, end, customerUpdate);
  }

  replaceChild(
    block: Block[],
    oldComponent: Block,
    customerUpdate: boolean = false
  ): Block[] {
    let parent = this.getParent();
    return parent.replaceChild(block, this, customerUpdate);
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): StructureCollection<Block> {
    let parent = this.getParent();
    return parent.splitChild(index, customerUpdate);
  }

  childHeadDelete(
    component: Block,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    return parent.childHeadDelete(this, index, customerUpdate);
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    return parent.split(index, block, customerUpdate);
  }

  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    return this.getChild().sendTo(block);
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    return this.getChild().receive(block, customerUpdate);
  }

  destory() {
    let child = this.getChild();
    child.active = false;
    child.parent = undefined;
    this.active = false;
    this.children = this.children.remove(0);
    this.parent = undefined;
  }
}

export default BlockWrapper;
