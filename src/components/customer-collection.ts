import { getComponentFactory } from ".";
import { operatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../content";
import { storeData } from "../decorate";
import { initRecordState } from "../record/decorators";
import nextTicket from "../util/next-ticket";

export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  tag: string;
}

@initRecordState
class CustomerCollection extends StructureCollection<Block> {
  type = ComponentType.customerCollection;
  tag: string;

  static create(raw: IRawType): CustomerCollection {
    let factory = getComponentFactory();
    let children = raw.children
      ? raw.children.map((item) => factory.typeMap[item.type].create(item))
      : [];
    let collection = factory.buildCustomerCollection(raw.tag);
    collection.add(children);
    return collection;
  }

  static exchange(
    block: Block,
    args: any[] = [],
    customerUpdate: boolean = false
  ): Block[] {
    let parent = block.getParent();

    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为 CustomerCollection，并且 tag 一致，直接添加
    if (prev instanceof CustomerCollection && prev.tag === args[0]) {
      prev.add(block, undefined, customerUpdate);
    } else {
      // 否则新生成一个 CustomerCollection
      let newList = getComponentFactory().buildCustomerCollection(args[0]);
      newList.add(block, 0, true);
      parent.add(newList, index, customerUpdate);
    }
    return [block];
  }

  constructor(
    tag: string = "div",
    children: (string | Block)[] = [],
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.tag = tag;
    let block = children.map((item) => {
      if (typeof item === "string") {
        item = getComponentFactory().buildParagraph(item);
      }
      return item;
    });
    this.add(block, 0, true);
  }

  getType(): string {
    return `${this.type}>${this.tag}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.tag = this.tag;
    return raw;
  }

  createEmpty(): CustomerCollection {
    return getComponentFactory().buildCustomerCollection(
      this.tag,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  add(
    block: Block | Block[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    // 连续输入空行，截断列表
    if (typeof index === "number" && index > 1) {
      let now = this.getChild(index - 1);
      if (now?.isEmpty() && !Array.isArray(block) && block.isEmpty()) {
        let focus = this.split(index, block, customerUpdate);
        now.removeSelf();
        return focus;
      }
    }
    if (!Array.isArray(block)) block = [block];
    let newBlock = this.addChildren(block, index, customerUpdate);
    return newBlock.length ? [newBlock[0], 0, 0] : undefined;
  }

  removeChildren(
    indexOrComponent: Block | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): Block[] {
    // 若子元素全部删除，将自己也删除
    if (removeNumber === this.getSize()) {
      nextTicket(() => {
        if (this.getSize() !== 0) return;
        this.removeSelf(customerUpdate);
      });
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
  }

  childHeadDelete(
    block: Block,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return;
      return block.sendTo(prev, customerUpdate);
    }

    // 第一项时，直接将该列表项添加到父元素上
    let parent = this.getParent();
    index = parent.findChildrenIndex(this);
    block.removeSelf(customerUpdate);
    return parent.add(block, index);
  }

  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    return block.receive(this, customerUpdate);
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    if (!block) return;
    block.removeSelf();
    if (block.isEmpty()) {
      block.removeSelf();
      let last = this.getChild(this.getSize() - 1);
      let lastSize = last.getSize();
      return [last, lastSize, lastSize];
    }
    return this.add(block, undefined, customerUpdate);
  }

  snapshoot(): IListSnapshoot {
    let snap = super.snapshoot() as IListSnapshoot;
    snap.tag = this.tag;
    return snap;
  }

  restore(state: IListSnapshoot) {
    this.tag = state.tag;
    super.restore(state);
  }

  render() {
    let build = getContentBuilder();
    let content = build.buildCustomerCollection(
      this.id,
      this.tag,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
    return content;
  }
}

export default CustomerCollection;
