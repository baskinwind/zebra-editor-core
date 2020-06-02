import Component, { operatorType, classType } from "./component";
import Inline from "./inline";
import Collection from "./collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import updateComponent from "../selection-operator/update-component";
import StructureCollection from "./structure-collection";
import ContentCollection from "./content-collection";

type listType = "ol" | "ul";

class List extends StructureCollection<ListItem> {
  type = ComponentType.list;
  structureType = StructureType.collection;
  listType: listType;

  constructor(type: listType = "ul", style?: storeData, data?: storeData) {
    super(style, data);
    this.listType = type;
  }

  createEmpty() {
    return new List(
      this.listType,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }

  setListType(type: listType = "ul") {
    this.listType = type;
    updateComponent(this);
  }

  whenChildHeadDelete(component: ListItem, index: number): operatorType {
    if (index !== 0) {
      let prev = this.children.get(index - 1);
      if (!prev) return;
      let size = prev.children.size;
      prev.addIntoTail(component);
      return [prev, size, size];
    }
    if (!this.parent) return;
    component.removeSelf();
    index = this.parent.findChildrenIndex(this);
    Paragraph.exchangeOnly(component);
    this.parent.addChildren([component], index);
    return [component, 0, 0];
  }

  add(
    component: ListItem | ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return this.addChildren(component, index, customerUpdate);
  }

  addIntoTail(
    component: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    component.removeSelf();
    ListItem.exchangeOnly(component, []);
    return this.addChildren(component, undefined, customerUpdate);
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
  static exchange(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    component = super.exchangeOnly(component, args) as ListItem;
    if (!component.parent) return component;
    let prev = component.parent.getPrev(component);
    let index = component.parent.findChildrenIndex(component);
    if (prev instanceof List) {
      prev.addIntoTail(component, customerUpdate);
    } else {
      let parent = component.parent;
      component.removeSelf();
      let newList = new List(args[0]);
      newList.addChildren(component, undefined, customerUpdate);
      newList.addIntoParent(parent, index, customerUpdate);
    }
    return component;
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
    let newParagraph = builder.exchange(this, args, true);
    if (parent.actived) {
      parent.split(index, newParagraph, customerUpdate);
    } else {
      newParagraph.addIntoParent(grandParent, parentIndex);
    }
    return [newParagraph, 0, 0];
  }

  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) return;
    let itemIndex = parent.findChildrenIndex(this);
    if (this.children.size === 0 && itemIndex !== 0) {
      this.removeSelf();
      if (!component) component = new Paragraph();
      return parent.split(itemIndex, component, customerUpdate);
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
