import ComponentFactory from ".";
import { operatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { storeData } from "../decorate";
import nextTicket from "../util/next-ticket";

export type listType = "ol" | "ul" | "nl";
export interface IListSnapshoot extends ICollectionSnapshoot<Block> {
  listType: listType;
}

class List extends StructureCollection<Block> {
  type = ComponentType.list;
  listType: listType;

  static create(componentFactory: ComponentFactory, raw: IRawType): List {
    let children = raw.children
      ? raw.children.map((item: IRawType) =>
          componentFactory.typeMap[item.type].create(item),
        )
      : [];
    let list = componentFactory.buildList(raw.listType);
    list.add(children);
    return list;
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[] = [],
    customerUpdate: boolean = false,
  ): Block[] {
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
      prev.add(block, undefined, customerUpdate);
    } else {
      // 否则新生成一个 List
      let newList = componentFactory.buildList(args[0]);
      newList.add(block, 0, true);
      parent.add(newList, index, customerUpdate);
    }
    return [block];
  }

  constructor(
    type: listType = "ul",
    children: (string | Block)[] = [],
    style?: storeData,
    data?: storeData,
  ) {
    super(style, data);
    this.listType = type;
    let list = children.map((item) => {
      if (typeof item === "string") {
        return this.getComponentFactory().buildParagraph(item);
      }
      return item;
    });
    this.addChildren(list, 0, true);
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px",
      });
    }
  }

  setListType(type: listType = "ol") {
    if (type === this.listType) return;
    this.listType = type;
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px",
      });
    } else {
      this.decorate.mergeStyle({ remove: "paddingLeft" });
    }
    updateComponent(this.editor, this);
  }

  getType(): string {
    return `${this.type}>${this.listType}`;
  }

  getStatistic() {
    let res = super.getStatistic();
    res.list += 1;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.listType = this.listType;
    return raw;
  }

  createEmpty(): List {
    return this.getComponentFactory().buildList(
      this.listType,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData(),
    );
  }

  addChildren(block: Block[], index?: number, customerUpdate: boolean = false) {
    // 列表仅能添加 wrapper 包裹的组件
    let list: Block[] = block.map((item) => {
      if (this.listType === "nl") {
        item.decorate.mergeStyle({ display: "block" });
      } else {
        item.decorate.mergeStyle({ remove: "display" });
      }
      return item;
    });
    return super.addChildren(list, index, customerUpdate);
  }

  add(
    block: Block | Block[],
    index?: number,
    customerUpdate: boolean = false,
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
    let newEmpty = this.addChildren(block, index, customerUpdate);
    return newEmpty.length ? [newEmpty[0], 0, 0] : undefined;
  }

  removeChildren(
    indexOrComponent: Block | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false,
  ): Block[] {
    // 若子元素全部删除，将自己也删除
    if (removeNumber === this.getSize()) {
      nextTicket(() => {
        if (this.getSize() !== 0) return;
        this.removeSelf(customerUpdate);
      });
    }
    let removed = super.removeChildren(
      indexOrComponent,
      removeNumber,
      customerUpdate,
    );
    return removed;
  }

  childHeadDelete(
    block: Block,
    index: number,
    customerUpdate: boolean = false,
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
    if (block instanceof List) {
      return this.add(
        block.removeChildren(0, block.getSize()),
        undefined,
        customerUpdate,
      );
    } else {
      if (block.isEmpty()) {
        block.removeSelf();
        let last = this.getChild(this.getSize() - 1);
        let lastSize = last.getSize();
        return [last, lastSize, lastSize];
      }
      return this.add(block, undefined, customerUpdate);
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

  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false) {
    let content = contentBuilder.buildList(
      this.id,
      () =>
        this.children
          .map((item) => contentBuilder.buildListItem(item, onlyDecorate))
          .toArray(),
      this.decorate.getStyle(onlyDecorate),
      {
        ...this.decorate.getData(onlyDecorate),
        tag: this.listType === "nl" ? "ul" : this.listType,
      },
    );
    return content;
  }
}

export default List;
