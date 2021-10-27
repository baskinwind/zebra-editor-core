import Editor from "../editor";
import { OperatorType, JSONType } from "./component";
import { CollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import AbstractView from "../view/base-view";
import ComponentType from "../const/component-type";
import { AnyObject } from "../decorate";
import ComponentFactory from "../factory";

export interface CustomCollectionSnapshoot extends CollectionSnapshoot<Block> {
  tag: string;
}

class CustomCollection extends StructureCollection<Block> {
  type: string = ComponentType.customerCollection;
  tag: string;

  static create(componentFactory: ComponentFactory, raw: JSONType): CustomCollection {
    let children = (raw.children || []).map((each) => {
      return componentFactory.typeMap[each.type].create(each);
    });

    let collection = componentFactory.buildCustomCollection(raw.tag);
    collection.add(0, ...children);
    return collection;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Block[] {
    let parent = block.getParent();
    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为 CustomCollection，并且 tag 一致，直接添加
    if (prev instanceof CustomCollection && prev.tag === args[0]) {
      prev.add(-1, block);
    } else {
      // 否则新生成一个 CustomCollection
      let newList = componentFactory.buildCustomCollection(args[0]);
      newList.add(0, block);
      parent.add(index, newList);
    }
    return [block];
  }

  constructor(tag: string = "div", children: (string | Block)[] = [], editor?: Editor) {
    super(editor);
    this.tag = tag;
    this.add(
      0,
      ...children.map((each) => {
        if (typeof each === "string") {
          return this.getComponentFactory().buildParagraph(each);
        } else {
          return each;
        }
      }),
    );
  }

  add(index: number, ...blockList: Block[]): OperatorType {
    index = index < 0 ? this.getSize() + 1 + index : index;

    // 连续输入空行，截断列表
    if (
      index > 1 &&
      blockList.length === 1 &&
      blockList[0].isEmpty() &&
      this.getChild(index - 1).isEmpty()
    ) {
      let operator = this.split(index, ...blockList);
      this.getChild(index - 1).removeSelf();
      return operator;
    }

    return super.add(index, ...blockList);
  }

  childHeadDelete(block: Block): OperatorType {
    let parent = this.getParent();
    let index = this.getParent().findChildrenIndex(this);

    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return;
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
      return [{ id: last.id, offset: lastSize }];
    }

    return this.add(-1, block);
  }

  snapshoot(): CustomCollectionSnapshoot {
    let snap = super.snapshoot() as CustomCollectionSnapshoot;
    snap.tag = this.tag;
    return snap;
  }

  restore(state: CustomCollectionSnapshoot) {
    this.tag = state.tag;
    super.restore(state);
  }

  createEmpty(): CustomCollection {
    const collection = this.getComponentFactory().buildCustomCollection(this.tag, []);
    collection.modifyDecorate(this.decorate.copyStyle(), this.decorate.copyData());
    return collection;
  }

  getType(): string {
    return `${this.type}>${this.tag}`;
  }

  getJSON(): JSONType {
    let raw = super.getJSON();
    raw.tag = this.tag;
    return raw;
  }

  render(contentView: AbstractView) {
    let content = contentView.buildCustomCollection(
      this.id,
      this.tag,
      () => this.children.toArray().map((each) => each.render(contentView)),
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
    return content;
  }
}

export default CustomCollection;
