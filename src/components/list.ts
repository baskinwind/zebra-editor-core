import Component, { operatorType, classType, rawType } from "./component";
import Block from "./block";
import ContentCollection from "./content-collection";
import StructureCollection from "./structure-collection";
import PlainText from "./plain-text";
import Paragraph from "./paragraph";
import ComponentType from "../const/component-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import { createError } from "./util";
import { initRecordState } from "../record/decorators";

type listType = "ol" | "ul";

@initRecordState
class List extends StructureCollection<ListItem> {
  type = ComponentType.list;
  listType: listType;

  static create(raw: rawType): List {
    let children = raw.children
      ? raw.children.map((item: rawType) => ListItem.create(item))
      : [];
    return new List(raw.listType, children, raw.style, raw.data);
  }

  static exchangeOnly(block: Block, args: any[] = []): ListItem[] {
    return ListItem.exchangeOnly(block, args);
  }

  static exchange(
    block: Block,
    args: any[] = [],
    customerUpdate: boolean = false
  ): ListItem[] {
    let newItem = ListItem.exchangeOnly(block);
    let parent = block.parent;
    if (!parent) throw createError("该节点已失效", block);
    let prev = parent.getPrev(block);
    let index = parent.findChildrenIndex(block);
    if (prev instanceof List && prev.listType === args[0]) {
      // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
      prev.add(newItem, undefined, customerUpdate);
    } else {
      // 否则新生成一个 List
      let newList = new List(args[0]);
      newList.add(newItem, 0, true);
      parent.add(newList, index, customerUpdate);
    }
    block.removeSelf();
    return newItem;
  }

  constructor(
    type: listType = "ul",
    children: (string | ListItem)[] = [],
    style?: storeData,
    data?: storeData
  ) {
    super(style, data);
    this.listType = type;
    let list = children.map((item) => {
      if (typeof item === "string") {
        item = new ListItem(item);
      }
      return item;
    });
    this.addChildren(list, 0, true);
  }

  setListType(type: listType = "ul") {
    if (type === this.listType) return;
    this.listType = type;
    updateComponent(this);
  }

  createEmpty() {
    return new List(
      this.listType,
      [],
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  addChildren(
    listItem: ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    // 列表不允许添加非段落内容
    listItem = listItem.filter((item) => item instanceof ContentCollection);
    super.addChildren(listItem, index, customerUpdate);
  }

  removeChildren(
    indexOrComponent: ListItem | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ) {
    // 若子元素需要全部，将自己也删除
    if (removeNumber === this.getSize()) {
      this.removeSelf(customerUpdate);
      return [...this.children];
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
  }

  childHeadDelete(
    listItem: ListItem,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.children.get(index - 1);
      if (!prev) return;
      let size = prev.getSize();
      listItem.sendTo(prev, customerUpdate);
      return [prev, size, size];
    }
    // 第一项时，直接将该列表项转换为段落
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    index = parent.findChildrenIndex(this);
    listItem.removeSelf(customerUpdate);
    let paragraph = Paragraph.exchangeOnly(listItem);
    parent.addChildren(paragraph, index);
    return [paragraph[0], 0, 0];
  }

  add(
    listItem: ListItem | ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(listItem)) listItem = [listItem];
    this.addChildren(listItem, index, customerUpdate);
    return;
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    if (!block) return;
    block.removeSelf();
    let newList = ListItem.exchangeOnly(block, []);
    this.addChildren(newList, undefined, customerUpdate);
    return [newList[0], -1, -1];
  }

  getRaw(): rawType {
    let raw = super.getRaw();
    raw.listType = this.listType;
    return raw;
  }

  render() {
    let children = this.children.map((item) => item.render()).toArray();
    return getContentBuilder().buildList(
      this.id,
      children,
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: this.listType }
    );
  }
}

@initRecordState
class ListItem extends ContentCollection {
  parent?: List;
  type = ComponentType.listItem;

  static create(raw: any): ListItem {
    let listItem = new ListItem("", raw.style, raw.data);
    let children = super.getChildren(raw);
    listItem.addChildren(children, 0, true);
    return listItem;
  }

  static exchangeOnly(block: Block, args: any[] = []): ListItem[] {
    let list: ListItem[] = [];
    if (block instanceof ContentCollection) {
      let newItem = new ListItem();
      newItem.addChildren(block.children.toArray(), 0);
      list.push(newItem);
    } else if (block instanceof PlainText) {
      let stringList = block.content.split("\n");
      if (stringList[stringList.length - 1].length === 0) {
        stringList.pop();
      }
      stringList.forEach((item) => {
        list.push(new ListItem(item));
      });
    }
    return list;
  }

  createEmpty() {
    return new ListItem("", this.decorate.getStyle(), this.decorate.getData());
  }

  exchangeTo(
    builder: classType,
    args: any[],
    customerUpdate: boolean = false
  ): Block[] {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    if (builder === List) {
      parent.setListType(args[0]);
      return [this];
    }
    let grandParent = parent?.parent;
    if (!grandParent) throw createError("该节点已失效", this);
    let index = parent.findChildrenIndex(this);
    let parentIndex = grandParent.findChildrenIndex(parent);
    this.removeSelf();
    let newListItem = builder.exchangeOnly(this, args);
    // 当列表仅有一项时，removeSelf 导致 parent 也会被删除
    if (parent.active) {
      parent.split(index, newListItem, customerUpdate);
    } else {
      grandParent.addChildren(newListItem, parentIndex);
    }
    return newListItem;
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let itemIndex = parent.findChildrenIndex(this);
    // 连续两个空行则切断列表
    if (this.isEmpty() && itemIndex !== 0) {
      this.removeSelf();
      if (!block) block = new Paragraph();
      return parent.split(itemIndex, block, customerUpdate);
    }
    // 不允许非内容集合添加
    let flag: boolean = false;
    if (block) {
      if (!Array.isArray(block)) block = [block];
      let list: ListItem[] = [];
      block
        .filter((item) => item instanceof ContentCollection)
        .forEach((item) => list.push(...ListItem.exchangeOnly(item)));
      flag = list.length === 0;
      block = list;
    }
    if (flag) {
      throw createError("不允许非内容集合添加", this);
    }
    return super.split(index, block, customerUpdate);
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: "li" }
    );
  }
}

export default List;
