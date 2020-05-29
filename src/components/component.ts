import Collection from "./collection";
import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";
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
    saveComponent(this);
  }

  exchangeToOther(builder: { exchang: Function }, args: any[]) {
    return;
  }

  addIntoParent(
    collection: Collection<Component | Collection<Component>>,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return collection.addChildren(this, index, customerUpdate);
  }

  removeSelf(customerUpdate: boolean = false): operatorType {
    return this.parent?.removeChildren(this, undefined, customerUpdate);
  }

  replaceSelf(
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
    return this.parent?.replaceChild(component, this, customerUpdate);
  }

  add(
    component: any,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  addIntoTail(
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  split(
    index: number,
    customerUpdate: boolean = false,
    component?: Component
  ): operatorType {
    return;
  }

  remove(
    start?: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  modifyContentDecorate(
    start: number,
    end: number,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    return;
  }

  modifyDecorate(
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
    updateComponent(this, customerUpdate);
    return;
  }

  abstract render(): any;
}
