import ContentCollection from "./content-collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import StructureCollection from "./structure-collection";
import updateComponent from "../selection-operator/update-component";
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
    return super.removeChildren(
      indexOrComponent,
      removeNumber,
      customerUpdate
    );
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
    if (!parent) return;
    index = parent.findChildrenIndex(this);
    component.removeSelf(customerUpdate);
    Paragraph.exchangeOnly(component);
    parent.addChildren([component], index);
    return [component, 0, 0];
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
    component = ListItem.exchangeOnly(component, []);
    this.addChildren([component as ListItem], undefined, customerUpdate);
    return;
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

  static exchange(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    component = this.exchangeOnly(component, args);
    if (!component.parent) throw createError("该组件没有父组件", component);
    let prev = component.parent.getPrev(component);
    let index = component.parent.findChildrenIndex(component);
    if (prev instanceof List && prev.listType === args[0]) {
      // 当前一块内容为列表，并且列表的类型一致，直接添加到列表项中
      component.send(prev, customerUpdate);
    } else {
      // 直接加入到父组件中
      let parent = component.parent;
      component.removeSelf();
      let newList = new List(args[0]);
      newList.addChildren([component as ListItem], undefined, true);
      newList.addInto(parent, index, customerUpdate);
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

  exchangeToOther(
    builder: classType,
    args: any[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent as List;
    if (!parent) return;
    if (builder === ListItem) {
      parent.setListType(args[0]);
      return;
    }
    let grandParent = parent?.parent;
    if (!grandParent) return;
    let index = parent.findChildrenIndex(this);
    let parentIndex = grandParent.findChildrenIndex(parent);
    this.removeSelf();
    let newCollection = builder.exchangeOnly(this, args);
    if (parent.active) {
      parent.split(index, newCollection, customerUpdate);
    } else {
      newCollection.addInto(grandParent, parentIndex);
    }
    return [newCollection, 0, 0];
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) return;
    let itemIndex = parent.findChildrenIndex(this);
    // 连续两个空行则切断列表
    if (this.isEmpty() && itemIndex !== 0) {
      this.removeSelf();
      if (!component) component = new Paragraph();
      return parent.split(itemIndex, component, customerUpdate);
    }
    // 不允许别的类型添加
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
