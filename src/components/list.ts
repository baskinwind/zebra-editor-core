import ContentCollection from "./content-collection";
import PlainText from "./plain-text";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import StructureCollection from "./structure-collection";
import updateComponent from "../util/update-component";
import Component, { operatorType, classType, rawType } from "./component";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import { createError } from "./util";

type listType = "ol" | "ul";

class List extends StructureCollection<ListItem> {
  type = ComponentType.list;
  structureType = StructureType.structure;
  listType: listType;

  static create(raw: rawType): List {
    let children = raw.children
      ? raw.children.map((item: rawType) => ListItem.create(item))
      : [];
    return new List(raw.listType, children, raw.style, raw.data);
  }

  static exchangeOnly(component: Component, args: any[] = []): ListItem[] {
    return ListItem.exchangeOnly(component, args);
  }

  static exchange(
    component: Component,
    args: any[] = [],
    customerUpdate: boolean = false
  ): ListItem[] {
    let newItem = ListItem.exchangeOnly(component);
    let parent = component.parent;
    if (!parent) throw createError("该节点已失效", component);
    let prev = parent.getPrev(component);
    let index = parent.findChildrenIndex(component);
    if (prev instanceof List && prev.listType === args[0]) {
      // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
      prev.add(newItem, undefined, customerUpdate);
    } else {
      // 否则新生成一个 List
      let newList = new List(args[0]);
      newList.add(newItem, 0, true);
      parent.add(newList, index, customerUpdate);
    }
    component.removeSelf();
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
    component: ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    // 列表不允许添加非段落内容
    component = component.filter((item) => item instanceof ContentCollection);
    super.addChildren(component, index, customerUpdate);
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
    component: ListItem,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    // 不是第一项时，将其发送到前一项
    if (index !== 0) {
      let prev = this.children.get(index - 1);
      if (!prev) return;
      let size = prev.getSize();
      component.sendTo(prev, customerUpdate);
      return [prev, size, size];
    }
    // 第一项时，直接将该列表项转换为段落
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    index = parent.findChildrenIndex(this);
    component.removeSelf(customerUpdate);
    let paragraph = Paragraph.exchangeOnly(component);
    parent.addChildren(paragraph, index);
    return [paragraph[0], 0, 0];
  }

  add(
    component: ListItem | ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(component)) component = [component];
    this.addChildren(component, index, customerUpdate);
    return;
  }

  receive(
    component?: ContentCollection,
    customerUpdate: boolean = false
  ): operatorType {
    if (!component) return;
    component.removeSelf();
    let newList = ListItem.exchangeOnly(component, []);
    this.addChildren(newList, undefined, customerUpdate);
    return [newList[0], -1, -1];
  }

  getRaw(): rawType {
    let raw = super.getRaw();
    raw.listType = this.listType;
    return raw;
  }

  render() {
    let children = this.children
      .map((component: ListItem) => component.render())
      .toArray();
    return getContentBuilder().buildList(
      this.id,
      children,
      this.decorate.getStyle(),
      { ...this.decorate.getData(), tag: this.listType }
    );
  }
}

class ListItem extends ContentCollection {
  parent?: List;
  type = ComponentType.listItem;

  static create(raw: any): ListItem {
    let listItem = new ListItem("", raw.style, raw.data);
    let children = super.getChildren(raw);
    listItem.addChildren(children, 0, true);
    return listItem;
  }

  static exchangeOnly(component: Component, args: any[] = []): ListItem[] {
    let list: ListItem[] = [];
    if (component instanceof ContentCollection) {
      let newItem = new ListItem();
      newItem.addChildren(component.children.toArray(), 0);
      list.push(newItem);
    } else if (component instanceof PlainText) {
      let stringList = component.content.split("\n");
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
  ): Component[] {
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
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let itemIndex = parent.findChildrenIndex(this);
    // 连续两个空行则切断列表
    if (this.isEmpty() && itemIndex !== 0) {
      this.removeSelf();
      if (!component) component = new Paragraph();
      return parent.split(itemIndex, component, customerUpdate);
    }
    // 不允许非内容集合添加
    let flag: boolean = false;
    if (component) {
      if (!Array.isArray(component)) component = [component];
      let list: ListItem[] = [];
      component
        .filter((item) => item instanceof ContentCollection)
        .forEach((item) => list.push(...ListItem.exchangeOnly(item)));
      flag = list.length === 0;
      component = list;
    }
    if (flag) {
      return;
    }
    return super.split(index, component, customerUpdate);
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
