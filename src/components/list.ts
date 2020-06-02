import { operatorType, classType } from "./component";
import Inline from "./inline";
import Collection from "./collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";
import updateComponent from "../selection-operator/update-component";

type listType = "ol" | "ul";

class List extends Collection<ListItem> {
  type = ComponentType.list;
  structureType = StructureType.collection;
  listType: listType;

  constructor(type: listType = "ul", style?: storeData, data?: storeData) {
    super(style, data);
    this.listType = type;
  }

  setListType(type: listType = "ul") {
    this.listType = type;
    updateComponent(this);
  }

  createEmpty() {
    return new List(
      this.listType,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
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
    this.parent.whenChildHeadDelete(component, index);
    // if (!this.parent) return;
    // let index = this.parent.findChildrenIndex(this);
    // component.removeSelf();
    // Paragraph.exchangeOnly(component);
    // component.addIntoParent(this.parent, index);
    // return [component, 0, 0];
  }

  addChildren(
    component: ListItem | ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (
      index !== undefined &&
      index > 1 &&
      !Array.isArray(component) &&
      this.children.size > 1 &&
      component.children.size === 0 &&
      this.children.get(index - 1)?.children.size === 0
    ) {
      if (!this.parent) return;
      let parentIndex = this.parent.findChildrenIndex(this);
      if (!parentIndex) return;
      this.removeChildren(index - 1, 1, customerUpdate);
      this.split(index - 1, undefined, customerUpdate);
      Paragraph.exchangeOnly(component);
      return component.addIntoParent(this.parent, parentIndex + 1);
    }
    return super.addChildren(component, index, customerUpdate);
  }

  removeChildren(
    indexOrComponent: ListItem | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
    if (this.children.size === 0) {
      this.removeSelf();
    }
    return;
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

class ListItem extends Paragraph {
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
