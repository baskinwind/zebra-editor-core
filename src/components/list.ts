import { operatorType, classType } from "./component";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import updateComponent from "../selection-operator/update-component";
import StructureCollection from "./structure-collection";
import Paragraph from "./paragraph";
import { createError } from "./util";
import createByRaw from "../util/create-by-raw";

type listType = "ol" | "ul";

class List extends StructureCollection<ListItem> {
  type = ComponentType.list;
  structureType = StructureType.collection;
  listType: listType;

  static create(raw: any): List {
    let children = raw.children.map((item: any) => createByRaw(item));
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

  createEmpty() {
    return new List(
      this.listType,
      [],
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  setListType(type: listType = "ul") {
    this.listType = type;
    updateComponent(this);
  }

  addChildren(
    component: ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    component = component.filter((item) => item instanceof ContentCollection);
    super.addChildren(component, index, customerUpdate);
  }

  childHeadDelete(component: ListItem, index: number): operatorType {
    if (index !== 0) {
      let prev = this.children.get(index - 1);
      if (!prev) return;
      let size = prev.children.size;
      prev.addIntoTail(component);
      return [prev, size, size];
    }
    let parent = this.parent;
    if (!parent) return;
    index = parent.findChildrenIndex(this);
    component.removeSelf();
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

  addIntoTail(
    component: ContentCollection,
    customerUpdate: boolean = false
  ): operatorType {
    component.removeSelf();
    ListItem.exchangeOnly(component, []);
    this.addChildren([component], undefined, customerUpdate);
    return;
  }

  getRaw() {
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
  type = ComponentType.listItem;

  static exchange(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    component = this.exchangeOnly(component, args) as ListItem;
    if (!component.parent) throw createError("该组件没有父组件", component);
    let prev = component.parent.getPrev(component);
    let index = component.parent.findChildrenIndex(component);
    if (prev instanceof List && prev.listType === args[0]) {
      prev.addIntoTail(component, customerUpdate);
    } else {
      let parent = component.parent;
      component.removeSelf();
      let newList = new List(args[0]);
      newList.addChildren([component], undefined, true);
      newList.addInto(parent, index, customerUpdate);
    }
  }

  static create(raw: any): ListItem {
    let listItem = new ListItem('', raw.style, raw.data);
    let children = super.createChildren(raw);
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
    if (builder === ListItem) {
      if (!this.parent) return;
      let parent = this.parent as List;
      if (args[0] === parent.listType) return;
      parent.setListType(args[0]);
      return;
    }
    let parent = this.parent;
    let grandParent = parent?.parent;
    if (!parent) return;
    if (!grandParent) return;
    let index = parent.findChildrenIndex(this);
    let parentIndex = grandParent.findChildrenIndex(parent);
    this.removeSelf();
    let newCollection = builder.exchangeOnly(this, args);
    if (parent.actived) {
      parent.split(index, newCollection, customerUpdate);
    } else {
      newCollection.addInto(grandParent, parentIndex);
    }
    return [newCollection, 0, 0];
  }

  split(
    index: number,
    component?: ListItem | ListItem[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) return;
    let itemIndex = parent.findChildrenIndex(this);
    // 连续两个空行则切断列表
    if (this.children.size === 0 && itemIndex !== 0) {
      this.removeSelf();
      if (!component) component = new Paragraph();
      return parent.split(itemIndex, component, customerUpdate);
    }
    // 不允许别的类型添加
    let flag: boolean = false;
    if (component) {
      if (!Array.isArray(component)) component = [component];
      component = component.filter((item) => item instanceof ListItem);
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

export { ListItem };

export default List;
