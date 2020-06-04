import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../selection-operator/update-component";
import { getId, saveComponent, createError } from "./util";
import { storeData } from "../decorate/index";
import StructureCollection from "./structure-collection";

export type operatorType = [Component, number, number] | undefined;
export type classType = typeof Component;
export interface rawType {
  type: ComponentType;
  children?: rawType[];
  style?: storeData;
  data?: storeData;
  // for CharacterList
  content?: string;
  // for Media or InlineImage
  src?: string;
  // fro Title
  titleType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  // for List
  listType?: "ul" | "ol";
  // for Table
  row?: number;
  col?: number;
  needHead?: boolean;
  // for TableRaw
  cellType?: "th" | "td";
}

abstract class Component {
  id: string = getId();
  parent?: StructureCollection<Component>;
  actived: boolean = false;
  decorate: Decorate;
  abstract type: ComponentType;
  abstract structureType: StructureType;

  static exchangeOnly(component: Component, args?: any[]): Component {
    throw createError("请为组件添加 exchangeOnly 静态方法", this);
  }

  static exchange(
    component: Component,
    args?: any[],
    customerUpdate: boolean = false
  ) {
    throw createError("请为组件添加 exchange 静态方法", this);
  }

  static create(raw: any): Component {
    throw createError("请为组件添加 create 静态方法", this);
  }

  constructor(style: storeData = {}, data: storeData = {}) {
    this.decorate = new Decorate(style, data);
    saveComponent(this);
  }

  createEmpty() {
    return Reflect.construct(this.constructor, [
      this.decorate.getStyle(),
      this.decorate.getData()
    ]);
  }

  isEmpty() {
    return false;
  }

  exchangeToOther(builder: classType, args: any[]) {
    return;
  }

  childHeadDelete(component: Component, index: number): operatorType {
    return;
  }

  addInto(
    collection: StructureCollection<Component>,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    collection.addChildren([this], index, customerUpdate);
    return [this, 0, 0];
  }

  removeSelf(customerUpdate: boolean = false): operatorType {
    this.parent?.removeChildren(this, 1, customerUpdate);
    return;
  }

  replaceSelf(
    component: Component,
    customerUpdate: boolean = false
  ): operatorType {
    this.parent?.replaceChild(component, this, customerUpdate);
    return [component, 0, 0];
  }

  add(
    component: string | Component | Component[],
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
    component?: Component | Component[],
    customerUpdate: boolean = false
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

  abstract getRaw(): rawType;

  abstract render(): any;
}

export default Component;
