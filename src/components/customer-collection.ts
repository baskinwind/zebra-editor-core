import ComponentFactory from ".";
import { OperatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import BaseBuilder from "../builder/base-builder";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";

export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  tag: string;
}

class CustomerCollection extends StructureCollection<Block> {
  type: string = ComponentType.customerCollection;
  tag: string;

  static create(componentFactory: ComponentFactory, raw: IRawType): CustomerCollection {
    let children = (raw.children || []).map((each) => {
      return componentFactory.typeMap[each.type].create(each);
    });

    let collection = componentFactory.buildCustomerCollection(raw.tag);
    collection.add(0, ...children);
    return collection;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Block[] {
    let parent = block.getParent();
    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为 CustomerCollection，并且 tag 一致，直接添加
    if (prev instanceof CustomerCollection && prev.tag === args[0]) {
      prev.add(-1, block);
    } else {
      // 否则新生成一个 CustomerCollection
      let newList = componentFactory.buildCustomerCollection(args[0]);
      newList.add(0, block);
      parent.add(index, newList);
    }
    return [block];
  }

  constructor(tag: string = "div", children: string[] = [], style?: StoreData, data?: StoreData) {
    super(style, data);
    this.tag = tag;
    this.add(0, ...children.map((each) => this.getComponentFactory().buildParagraph(each)));
  }

  add(index: number, ...block: Block[]): OperatorType {
    index = index < 0 ? this.getSize() + 1 + index : index;

    // 连续输入空行，截断列表
    if (
      index > 1 &&
      block.length === 1 &&
      block[0].isEmpty() &&
      this.getChild(index - 1).isEmpty()
    ) {
      let operator = this.split(index, ...block);
      this.getChild(index - 1).removeSelf();
      return operator;
    }

    let newBlock = this.addChildren(index, block);
    return [newBlock];
  }

  childHeadDelete(block: Block): OperatorType {
    let parent = this.getParent();
    let index = this.getParent().findChildrenIndex(this);

    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return [[this]];
      return block.sendTo(prev);
    }

    // 第一项时，直接将该列表项添加到父元素上
    block.removeSelf();
    return parent.add(index, block);
  }

  sendTo(block: Block): OperatorType {
    return block.receive(this);
  }

  receive(block: Block): OperatorType {
    if (block.isEmpty()) {
      block.removeSelf();
      let last = this.getChild(this.getSize() - 1);
      let lastSize = last.getSize();
      return [[last], { id: last.id, offset: lastSize }];
    }

    return this.add(-1, block);
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

  createEmpty(): CustomerCollection {
    return this.getComponentFactory().buildCustomerCollection(
      this.tag,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  getType(): string {
    return `${this.type}>${this.tag}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.tag = this.tag;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    let content = contentBuilder.buildCustomerCollection(
      this.id,
      this.tag,
      () => this.children.toArray().map((each) => each.render(contentBuilder)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
    return content;
  }
}

export default CustomerCollection;
