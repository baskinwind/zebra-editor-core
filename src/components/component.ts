import Collection from "./collection";
import ComponentType from "../const/component-type";
import Decorate from "../decorate";
import StructureType from "../const/structure-type";
import { getId, saveComponent } from "./util";
import { storeData } from "../decorate/index";

export type operatorType = [Component, number, number] | undefined;

export default abstract class Component {
  id: string = getId();
  parent?: Collection<Component | Collection<Component>>;
  actived: boolean = false;
  decorate: Decorate;
  abstract type: ComponentType;
  abstract structureType: StructureType;

  constructor(style: storeData = {}, data: storeData = {}) {
    this.decorate = new Decorate(style, data);
    Promise.resolve().then(() => {
      saveComponent(this);
    });
  }

  addIntoParent(
    collection: Collection<Component | Collection<Component>>,
    index?: number
  ): operatorType {
    return collection.addChildren(this, index);
  }

  removeSelf(): operatorType {
    return this.parent?.removeChildren(this);
  }

  replaceSelf(component: Component): operatorType {
    return this.parent?.replaceChild(component, this);
  }

  abstract render(): any;
}
