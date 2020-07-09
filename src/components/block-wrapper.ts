import { List } from "immutable";
import { operatorType } from "./component";
import StructureCollection from "./structure-collection";
import Block from "./block";
import ComponentBlockype from "../const/component-type";
import { storeData } from "../decorate";
import { createError } from "./util";
import { getContentBuilder } from "../content";

abstract class BlockWrapper extends StructureCollection<Block> {
  type = ComponentBlockype.empty;

  constructor(block: Block, style?: storeData, data?: storeData) {
    super(style, data);
    if (!block) {
      throw createError("BlockWrapper 组件必须拥有一个子组件");
    }
    this.children = List([block]);
    block.parent = this;
    block.active = true;
  }

  getChild(): Block {
    let child = this.children.get(0);
    if (!child) throw createError("子组件获取失败");
    return child;
  }

  getRealParent() {
    return this.getParent();
  }

  isEmpty(): boolean {
    return this.children.get(0)!.isEmpty();
  }

  getSize(): number {
    let parent = this.getParent();
    return parent.getSize();
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

  removeChildren(
    indexOrBlock: Block | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    let parent = this.getParent();
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
    let parent = this.getParent();
    return parent.remove(start, end, customerUpdate);
  }

  childHeadDelete(
    component: Block,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    return parent.childHeadDelete(this, index, customerUpdate);
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

  findChildrenIndex(idOrBlock: string | Block): number {
    let parent = this.getParent();
    return parent.findChildrenIndex(this);
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

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    return parent.split(index, block, customerUpdate);
  }

  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    return this.children.get(0)?.sendTo(block);
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    return this.children.get(0)?.receive(block, customerUpdate);
  }

  render() {
    return getContentBuilder().buildListItem(
      this.id,
      () => this.children.get(0)?.render(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export default BlockWrapper;
