import { getComponentFactory } from ".";
import { operatorType, IRawType } from "./component";
import { ICollectionSnapshoot } from "./collection";
import StructureCollection from "./structure-collection";
import Block from "./block";
import BlockWrapper from "./block-wrapper";
import ComponentMap from "../const/component-map";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../content";
import { storeData } from "../decorate";
import { initRecordState, recordMethod } from "../record/decorators";
import { nextTicket } from "./util";

export type listType = "ol" | "ul" | "nl";
export interface IListSnapshoot extends ICollectionSnapshoot<ListItemWrapper> {
  listType: listType;
}

class ListItemWrapper extends BlockWrapper {
  static create(raw: IRawType): ListItemWrapper {
    let children = raw.children
      ? raw.children.map((item: IRawType) => ComponentMap[item.type](item))
      : [];
    return new ListItemWrapper(children[0]);
  }

  render() {
    let style: any = {};
    let block = this.getChild();
    if (block instanceof List) {
      style.display = "block";
    }
    return getContentBuilder().buildListItem(
      this.id,
      () => this.getChild().render(),
      { ...this.decorate.getStyle(), ...style },
      this.decorate.getData()
    );
  }
}

@initRecordState
class List extends StructureCollection<ListItemWrapper> {
  type = ComponentType.list;
  listType: listType;
  style: storeData = {
    paddingLeft: "40px"
  };

  static create(raw: IRawType): List {
    let children = raw.children
      ? raw.children.map((item: IRawType) => ListItemWrapper.create(item))
      : [];
    let list = getComponentFactory().buildList();
    list.add(children);
    return list;
  }

  static exchange(
    block: Block,
    args: any[] = [],
    customerUpdate: boolean = false
  ): Block[] {
    let parent = block.getParent();

    // 属于列表的子元素
    if (parent instanceof ListItemWrapper) {
      let garend = parent.getParent();
      if (garend instanceof List) {
        garend.setListType(args[0]);
      }
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
      let newList = getComponentFactory().buildList(args[0]);
      newList.add(block, 0, true);
      parent.add(newList, index, customerUpdate);
    }
    return [block];
  }

  constructor(
    type: listType = "ul",
    children: (string | Block)[] = [],
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.listType = type;
    let list = children.map((item) => {
      if (typeof item === "string") {
        item = getComponentFactory().buildParagraph(item);
      }
      return item;
    });
    this.addChildren(list, 0, true);
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px"
      });
    }
  }

  @recordMethod
  setListType(type: listType = "ol") {
    if (type === this.listType) return;
    this.listType = type;
    if (this.listType === "nl") {
      this.decorate.mergeStyle({
        paddingLeft: "0px"
      });
    } else {
      this.decorate.mergeStyle({
        paddingLeft: "40px"
      });
    }
    this.children.forEach((item) => {
      if (this.listType === "nl") {
        item.decorate.mergeStyle({ display: "block" });
      } else {
        item.decorate.mergeStyle({ remove: "display" });
      }
    });
    updateComponent(this);
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
    return getComponentFactory().buildList(
      this.listType,
      [],
      this.decorate.copyStyle(),
      this.decorate.copyData()
    );
  }

  addChildren(block: Block[], index?: number, customerUpdate: boolean = false) {
    // 列表仅能添加 wrapper 包裹的组件
    let list: ListItemWrapper[] = block.map((item) => {
      if (!(item instanceof ListItemWrapper)) {
        item = new ListItemWrapper(item);
      }
      if (this.listType === "nl") {
        item.decorate.mergeStyle({ display: "block" });
      } else {
        item.decorate.mergeStyle({ remove: "display" });
      }
      return item as ListItemWrapper;
    });
    return super.addChildren(list, index, customerUpdate);
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
    let newEmpty = this.addChildren(block, index, customerUpdate);
    return newEmpty.length ? [newEmpty[0].getChild(), 0, 0] : undefined;
  }

  removeChildren(
    indexOrComponent: ListItemWrapper | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): ListItemWrapper[] {
    // 若子元素全部删除，将自己也删除
    if (removeNumber === this.getSize()) {
      nextTicket(() => {
        this.removeSelf(customerUpdate);
      });
    }
    let removed = super
      .removeChildren(indexOrComponent, removeNumber, customerUpdate)
      .map((item) => item.getChild());
    // @ts-ignore
    return removed;
  }

  replaceChild(
    block: Block[],
    oldComponent: ListItemWrapper,
    customerUpdate: boolean = false
  ): Block[] {
    // 列表仅能添加 wrapper 包裹的组件
    let list: ListItemWrapper[] = block.map((item) => {
      if (item instanceof ListItemWrapper) {
        return item;
      }
      return new ListItemWrapper(item);
    });
    return super.replaceChild(list, oldComponent, customerUpdate);
  }

  childHeadDelete(
    empty: ListItemWrapper,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.getPrev(empty);
      if (!prev) return;
      return empty.sendTo(prev, customerUpdate);
    }

    // 第一项时，直接将该列表项添加到父元素上
    let parent = this.getParent();
    index = parent.findChildrenIndex(this);
    empty.removeSelf(customerUpdate);
    return parent.add(empty.children.toArray(), index);
  }

  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    return block.receive(this, customerUpdate);
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    if (!block) return;
    block.removeSelf();
    return this.add(block, undefined, customerUpdate);
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

  render() {
    let build = getContentBuilder();
    let content = build.buildList(
      this.id,
      () => this.children.map((item) => item.render()).toArray(),
      this.decorate.getStyle(),
      {
        ...this.decorate.getData(),
        tag: this.listType === "nl" ? "ul" : this.listType
      }
    );
    return content;
  }
}

export default List;
