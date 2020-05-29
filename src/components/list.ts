import { operatorType, classType } from "./component";
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

  createEmpty() {
    return new List(
      this.listType,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
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
    component = ListItem.exchangeOnly(component, []);
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
      this.decorate.getData()
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
    if (builder === ListItem) return;
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

  removeChildren(
    indexOrComponent: Inline | number,
    removeNumber: number = 1,
    customerUpdate: boolean = false
  ): operatorType {
    if (
      typeof indexOrComponent === "number" &&
      indexOrComponent < 0 &&
      removeNumber === 1
    ) {
      let parent = this.parent;
      if (!parent) return;
      let prev = parent.getPrev(this);
      if (!prev) {
        let grandParent = parent.parent;
        if (!grandParent) return;
        let parentIndex = grandParent.findChildrenIndex(parent);
        this.removeSelf();
        Paragraph.exchangeOnly(this);
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

export { ListItem };

export default List;
