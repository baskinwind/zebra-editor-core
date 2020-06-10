import Decorate from "../decorate";
import Record from "../record";
import Collection from "./collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import DirectionType from "../const/direction-type";
import updateComponent from "../util/update-component";
import { getId, saveComponent, createError } from "./util";
import { storeData } from "../decorate/index";

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
  // for Media
  mediaType?: string;
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
  size?: number;
}

abstract class Component {
  id: string = getId();
  parent?: Collection<Component>;
  // 否是有效的
  active: boolean = false;
  // 修饰：样式，数据等
  decorate: Decorate;
  // 修改历史记录
  record: Record;
  // 类型，用于保存和恢复数据
  abstract type: ComponentType;
  // 结构上的作用
  abstract structureType: StructureType;

  // 定义如何将别的组件转换为当前组件，不会触发更新
  static exchangeOnly(component: Component, args?: any[]): Component[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  // 将别的组件转换为当前组件，并更新组件在文档中的状态
  static exchange(
    component: Component,
    args?: any[],
    customerUpdate: boolean = false
  ): Component[] {
    throw createError("组件未实现 exchange 静态方法", this);
  }

  // 根据 raw 保存的内容恢复组件
  static create(raw: any): Component {
    throw createError("组件未实现 create 静态方法", this);
  }

  constructor(style: storeData = {}, data: storeData = {}) {
    this.decorate = new Decorate(style, data);
    this.record = new Record(this);
    saveComponent(this);
  }

  // 判断该组件是否为空，为空并不代表无效
  isEmpty() {
    return false;
  }

  // 创建一个空的当前组件
  createEmpty(): Component {
    throw createError("组件未实现 createEmpty 方法", this);
  }

  // 将当前组件转换为 builder 类型的组件
  exchangeTo(builder: classType, args: any[]): Component[] {
    throw createError("组件未实现 exchangeTo 方法", this);
  }

  // 定义当组件的子组件的首位发生删除时的行为
  // 默认不处理，而不是报错
  childHeadDelete(
    component: Component,
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  // 添加到某个组件内，被添加的组件必须为 StructureCollection 类型
  addInto(
    collection: Collection<Component>,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    collection.addChildren([this], index, customerUpdate);
    return [this, 0, 0];
  }

  // 从其父组件内移除
  removeSelf(customerUpdate: boolean = false): operatorType {
    this.parent?.removeChildren(this, 1, customerUpdate);
    return;
  }

  // 替换为另一个组件
  replaceSelf(
    component: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    if (!Array.isArray(component)) component = [component];
    this.parent?.replaceChild(component, this, customerUpdate);
    return [component[0], 0, 0];
  }

  // 添加子组件
  add(
    component: string | Component | Component[],
    index: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  // 在 index 处切分
  split(
    index: number,
    component?: Component | Component[],
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  // 移除子组件
  remove(
    start?: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  // 修改子组件的表现形式，仅在 ContentCollection 组件内有用
  modifyContentDecorate(
    start: number,
    end: number,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    return;
  }

  // 修改组件的表现形式
  modifyDecorate(
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
    updateComponent(this, customerUpdate);
    this.record.defaultStore();
    return;
  }

  // 将自己发送到另一组件
  send(component: Component, customerUpdate: boolean = false): operatorType {
    return;
  }

  // 接收另一组件
  receive(
    component?: Component,
    customerUpdate: boolean = false
  ): operatorType {
    return;
  }

  // 处理方向键，一般不用实现
  handleArrow(index: number, direction: DirectionType): operatorType {
    return;
  }

  // 获得当前组件的快照，用于撤销和回退
  snapshoot() {
    return {
      style: this.decorate.style,
      data: this.decorate.data
    };
  }

  // 回退组件状态
  restore(state?: any) {
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }

  // 获取用于存储的内容
  abstract getRaw(): rawType;

  // 渲染该组件
  abstract render(): any;
}

export default Component;
