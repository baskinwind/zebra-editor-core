import Component, { operatorType } from "./component";
import Inline from "./inline";
import Collection from "./collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate";

type listType = "ol" | "ul";

class List extends Collection<ListItem> {
  type = ComponentType.list;
  structureType = StructureType.collection;
  listType: listType;

  constructor(type: listType = "ul", style?: storeData, data?: storeData) {
    super(style, data);
    this.listType = type;
    this.decorate.setData("tag", this.listType);
  }

  addChildren(
    component: ListItem | ListItem[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (
      index !== undefined &&
      !Array.isArray(component) &&
      this.children.get(index - 1)?.children.size === 0
    ) {
      if (!this.parent) return;
      let parentIndex = this.parent.findChildrenIndex(this);
      if (!parentIndex) return;
      this.removeChildren(index - 1, 1, customerUpdate);
      this.split(index - 1, customerUpdate);
      Reflect.setPrototypeOf(component, Paragraph.prototype);
      return component.addIntoParent(this.parent, parentIndex + 1);
    }
    return super.addChildren(component, index, customerUpdate);
  }

  removeChildren(
    indexOrComponent: Paragraph | number,
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
    return this.addChildren(component, undefined, customerUpdate);
  }

  split(
    index: number,
    customerUpdate: boolean = false,
    component?: Component
  ): operatorType {
    let tail = this.children.slice(index).toArray();
    this.removeChildren(index, this.children.size, customerUpdate);
    if (!this.parent) return;
    let componentIndex = this.parent.findChildrenIndex(this);
    componentIndex += 1;
    if (component) {
      component.addIntoParent(this.parent, componentIndex, customerUpdate);
      componentIndex += 1;
    }
    if (tail.length === 0) return;
    let newList = new List(
      this.listType,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
    newList.addChildren(tail, 0, customerUpdate);
    newList.addIntoParent(this.parent, componentIndex, customerUpdate);
    return;
  }

  render() {
    let children = this.children
      .map((component) => component.render())
      .toArray();
    return getContentBuilder().buildList(
      this.id,
      children,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}

export class ListItem extends Paragraph {
  static exchang(
    component: Paragraph,
    args: any[],
    customerUpdate: boolean = false
  ) {
    component = super.exchang(component, args, true) as ListItem;
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

  exchangeToOther(
    builder: { exchang: Function },
    args: any[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    let grandParent = parent?.parent;
    if (!parent) return;
    if (!grandParent) return;
    let parentIndex = grandParent.findChildrenIndex(parent);
    this.removeSelf();
    let newParagraph = builder.exchang(this, args, true);
    if (this.parent) {
      let index = parent.findChildrenIndex(this);
      this.parent.split(index, customerUpdate, newParagraph);
    } else {
      newParagraph.addIntoParent(grandParent, parentIndex);
    }
    return [newParagraph, 0, 0];
  }

  removeChildren(
    indexOrComponent: Inline | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    if (indexOrComponent === 0 && removeNumber === 1) {
      let parent = this.parent;
      if (!parent) return;
      let prev = parent.getPrev(this);
      if (!prev) {
        let grandParent = parent.parent;
        if (!grandParent) return;
        let parentIndex = grandParent.findChildrenIndex(parent);
        this.removeSelf();
        this.addIntoParent(grandParent, parentIndex);
        return [this, 0, 0];
      }
    }
    return super.removeChildren(indexOrComponent, removeNumber, customerUpdate);
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
