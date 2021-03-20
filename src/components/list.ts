import ComponentFactory from ".";
import { OperatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import ComponentType from "../const/component-type";
import { StoreData } from "../decorate";
import BaseBuilder from "../builder/base-builder";

export type listType = "ol" | "ul";
export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  listType: listType;
}

class List extends StructureCollection<Block> {
  type = ComponentType.list;
  listType: listType;

  static create(componentFactory: ComponentFactory, raw: IRawType): List {
    let children = (raw.children || []).map((each: IRawType) =>
      componentFactory.typeMap[each.type].create(each),
    );

    let list = componentFactory.buildList(raw.listType);
    list.add(0, ...children);
    return list;
  }

  static exchange(componentFactory: ComponentFactory, block: Block, args: any[] = []): Block[] {
    let parent = block.getParent();
    // 属于列表的子元素
    if (parent instanceof List) {
      parent.setListType(args[0]);
      return [block];
    }

    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    block.removeSelf();

    // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
    if (prev instanceof List && prev.listType === args[0]) {
      prev.add(-1, block);
    } else {
      // 否则新生成一个 List
      let newList = componentFactory.buildList(args[0]);
      newList.add(0, block);
      parent.add(index, newList);
    }
    return [block];
  }

  constructor(type: listType = "ul", children: string[] = [], style?: StoreData, data?: StoreData) {
    super(style, data);
    this.listType = type;
    this.add(0, ...children.map((each) => this.getComponentFactory().buildParagraph(each)));
  }

  setListType(type: listType = "ol") {
    if (type === this.listType) return;
    this.$emit("componentWillChange", this);
    this.listType = type;
    this.$emit("componentChanged", [this]);
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
      this.getChild(index - 1).removeSelf();
      let operator = this.split(index - 1, ...block);
      return operator;
    }

    return super.add(index, ...block);
  }

  childHeadDelete(block: Block): OperatorType {
    let index = this.findChildrenIndex(block);

    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(block);
      if (!prev) return [[this]];
      return block.sendTo(prev);
    }

    // 第一项时，直接将该列表项添加到父元素上
    block.removeSelf();
    let parent = this.getParent();
    let parentIndex = parent.findChildrenIndex(this);
    return parent.add(parentIndex, block);
  }

  sendTo(block: Block): OperatorType {
    return block.receive(this);
  }

  receive(block: Block): OperatorType {
    block.removeSelf();

    if (block instanceof List) {
      return this.add(-1, ...block.children);
    } else {
      if (block.isEmpty()) {
        let last = this.getChild(this.getSize() - 1);
        let lastSize = last.getSize();
        return [[last], { id: last.id, offset: lastSize }];
      }

      return this.add(-1, block);
    }
  }

  snapshoot(): IListSnapshoot {
    let snap = super.snapshoot() as IListSnapshoot;
    snap.listType = this.listType;
    return snap;
  }

  restore(state: IListSnapshoot) {
    this.listType = state.listType;
    super.restore(state);
  }

  createEmpty(): List {
    return this.getComponentFactory().buildList(
      this.listType,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  getType(): string {
    return `${this.type}>${this.listType}`;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.listType = this.listType;
    return raw;
  }

  render(contentBuilder: BaseBuilder) {
    let content = contentBuilder.buildList(
      this.id,
      this.listType,
      () => {
        return this.children.toArray().map((each) => {
          return contentBuilder.buildListItem(each.render(contentBuilder), each.structureType);
        });
      },
      this.decorate.getStyle(),
      this.decorate.getData(),
    );
    return content;
  }
}

export default List;
