import Collection from "./collection";
import Paragraph from "./paragraph";
import { storeData } from "../decorate";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import Component, { operatorType } from "./component";

type listType = "ol" | "ul";

class List extends Collection<Paragraph> {
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
      this.removeChildren(index - 1, 1, customerUpdate);
      component.decorate.removeData("tag");
      this.split(index - 1, component, customerUpdate);
      return;
    }
    if (Array.isArray(component)) {
      console.log(component);

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
    this.addChildren(component, undefined, customerUpdate);
    return [component, 0, 0];
  }

  split(
    index: number,
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
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
    this.parent.addChildren(component, componentIndex + 1, customerUpdate);
    newList.addIntoParent(this.parent, componentIndex + 2, customerUpdate);
    return [component, 0, 0];
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
  modifyDecorate(style?: storeData, data?: storeData) {
    // 列表项，不允许修改标签
    if (data) {
      delete data.tag;
    }
    return super.modifyDecorate(style, data);
  }
}

export default List;
