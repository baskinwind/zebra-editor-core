import Collection from "./collection";
import Paragraph from "./paragraph";
import { storeData } from "../decorate";
import StructureType from "../const/structure-type";
import ComponentType from "../const/component-type";
import { getContentBuilder } from "../builder";
import { operatorType } from "./component";

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
    this.addChildren(component, undefined, customerUpdate);
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

export default List;
