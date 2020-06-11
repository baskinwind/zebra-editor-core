import Decorate from "../decorate";
import Record from "../record";
import Block from "./block";
import Collection from "./collection";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { getId } from "./util";
import { storeData } from "../decorate/index";

export type operatorType = [Component, number, number] | undefined;
export type classType = { exchangeOnly: Function; exchange: Function };
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
  // 修饰：样式，数据等
  decorate: Decorate;
  // 修改历史记录
  record: Record;
  // 类型，用于保存和恢复数据
  abstract type: ComponentType;
  // 结构上的作用
  abstract structureType: StructureType;

  constructor(style: storeData = {}, data: storeData = {}) {
    this.decorate = new Decorate(style, data);
    this.record = new Record(this);
  }

  // 修改组件的表现形式
  modifyDecorate(
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
    if (this instanceof Block) {
      updateComponent(this, customerUpdate);
    }
    this.record.defaultStore();
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
  getRaw(): rawType {
    let raw: rawType = {
      type: this.type
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
    }
    return raw;
  }

  // 渲染该组件
  abstract render(): any;
}

export default Component;
