import Collection from "./collection";
import Paragraph from "./paragraph";
import { storeData } from "../decorate";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { operatorType } from "./component";
import updateComponent from "../selection-operator/update-component";

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
    component: Paragraph | Paragraph[],
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (
      index !== undefined &&
      !Array.isArray(component) &&
      this.children.get(index - 1)?.children.size === 0
    ) {
      if (!this.parent) return
      let parentIndex = this.parent.findChildrenIndex(this);
      if (!parentIndex) return;
      this.removeChildren(index - 1, 1, customerUpdate);
      this.split(index - 1, customerUpdate);
      component.decorate.removeData('tag');
      return component.addIntoParent(this.parent, parentIndex + 1);
    }

    if (Array.isArray(component)) {
      component.forEach((item) => item.decorate.setData("tag", "li"));
    } else {
      component.decorate.setData("tag", "li");
    }
    return super.addChildren(component, index, customerUpdate);
  }

  addIntoTail(
    component: Paragraph,
    customerUpdate: boolean = false
  ): operatorType {
    component.removeSelf();
    return this.addChildren(component, undefined, customerUpdate);
  }

  split(index: number, customerUpdate: boolean = false): operatorType {
    let tail = this.children.slice(index).toArray();
    this.removeChildren(index, this.children.size, customerUpdate);
    if (!this.parent) return;
    let componentIndex = this.parent.findChildrenIndex(this);
    let newList = new List(
      this.listType,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
    newList.addChildren(tail, 0, customerUpdate);
    newList.addIntoParent(this.parent, componentIndex + 1, customerUpdate);
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

  static exchang(component: Paragraph, args: any[]) {
    component.decorate.setData("tag", "li");
    Reflect.setPrototypeOf(component, ListItem.prototype);
    if (!component.parent) return component;
    let prev = component.parent.getPrev(component);
    let index = component.parent.findChildrenIndex(component)
    if (prev instanceof List) {
      prev.addIntoTail(component);
    } else {
      component.removeSelf();
      let newList = new List(args[0]);
      newList.addChildren(component);
      newList.addIntoParent(component.parent, index);
    }
    return component;
  }

  exchangeToOther(builder: { exchang: Function }, args: any[]): operatorType {
    if (!this.parent) return
    if (!this.parent.parent) return
    let index = this.parent.findChildrenIndex(this);
    let parentIndex = this.parent.parent.findChildrenIndex(this.parent);
    this.removeSelf();
    let newParagraph = builder.exchang(this, args, true);
    this.parent.split(index);
    newParagraph.addIntoParent(this.parent.parent, parentIndex + 1);
    return [newParagraph, 0, 0];
  }

  modifyDecorate(style?: storeData, data?: storeData, customerUpdate: boolean = false) {
    // 列表项，不允许修改标签
    if (data) {
      delete data.tag;
    }
    return super.modifyDecorate(style, data, customerUpdate);
  }
}

export default List;
