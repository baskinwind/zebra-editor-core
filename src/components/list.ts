import ContentCollection from "./content-collection";
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
    if (removeNumber === this.children.size) {
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
      let size = prev.children.size;
      component.send(prev, customerUpdate);
      return [prev, size, size];
    }
    // 第一项时，直接将该列表项转换为段落
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    index = parent.findChildrenIndex(this);
    component.removeSelf(customerUpdate);
    let paragraph = Paragraph.exchangeOnly(component);
    parent.addChildren([paragraph], index);
    return [paragraph, 0, 0];
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
    this.addChildren([newList], undefined, customerUpdate);
    return [newList, -1, -1];
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

  static exchangeOnly(
    component: Component | string,
    args: any[] = []
  ): ListItem {
    if (component instanceof ListItem) return component;
    let newItem = new ListItem();
    if (typeof component === "string") {
      newItem.addText(component, 0);
    } else if (component instanceof ContentCollection) {
      newItem.addChildren(component.children.toArray(), 0);
    }
    return newItem;
  }

  static exchange(
    component: ContentCollection,
    args: any[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = component.parent;
    if (!parent) throw createError("该节点已失效", component);
    let prev = parent.getPrev(component);
    let index = parent.findChildrenIndex(component);
    if (prev instanceof List && prev.listType === args[0]) {
      // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
      return component.send(prev, customerUpdate);
    } else {
      let newItem = this.exchangeOnly(component, args);
      let newList = new List(args[0]);
      newList.addChildren([newItem], 0, true);
      newList.addInto(parent, index, customerUpdate);
      component.removeSelf();
      return [newItem, -1, -1];
    }
  }

  static create(raw: any): ListItem {
    let listItem = new ListItem("", raw.style, raw.data);
    let children = super.getChildren(raw);
    listItem.addChildren(children, 0, true);
    return listItem;
  }

  createEmpty() {
    return new ListItem("", this.decorate.getStyle(), this.decorate.getData());
  }

  exchangeTo(
    builder: classType,
    args: any[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    if (builder === ListItem) {
      parent.setListType(args[0]);
      return [this, -1, -1];
    }
    let grandParent = parent?.parent;
    if (!grandParent) throw createError("该节点已失效", this);
    let index = parent.findChildrenIndex(this);
    let parentIndex = grandParent.findChildrenIndex(parent);
    this.removeSelf();
    let newListItem = builder.exchangeOnly(this, args);
    if (parent.active) {
      parent.split(index, newListItem, customerUpdate);
    } else {
      newListItem.addInto(grandParent, parentIndex);
    }
    return [newListItem, -1, -1];
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
      component = component.filter((item) => {
        if (!(item instanceof ContentCollection)) return;
        ListItem.exchangeOnly(item);
        return true;
      });
      flag = component.length === 0;
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

export { ListItem };
