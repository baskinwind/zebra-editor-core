import { Map } from "immutable";
import Event from "./event";
import Decorate from "../decorate";
import Record from "../record";
import Block from "./block";
import Collection from "./collection";
import BaseBuilder from "../content/base-builder";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getId } from "./util";
import { storeData } from "../decorate/index";
import { createError } from "../util/handle-error";
import { cursorType } from "../selection/util";

export type operatorType =
  | [Block[], cursorType, cursorType]
  | [Block[], cursorType]
  | [Block[]];

export type classType = { exchangeOnly: Function; exchange: Function };
export interface IRawType {
  id?: string;
  type: ComponentType | string;
  children?: IRawType[];
  style?: storeData;
  data?: storeData;
  // for CharacterList
  content?: string;
  // for Media or InlineImage
  src?: string;
  // for Media
  mediaType?: string;
  // fro Header
  headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  // for List
  listType?: "ul" | "ol" | "nl";
  // for Table
  row?: number;
  col?: number;
  needHead?: boolean;
  // for TableRaw
  cellType?: "th" | "td";
  size?: number;
  // for code
  language?: string;
  tag?: string;
}

export interface ISnapshoot {
  style: Map<string, string>;
  data: Map<string, string>;
}

abstract class Component extends Event {
  id: string = getId();
  parent?: Collection<Component>;
  // 样式，额外数据
  decorate: Decorate;
  // 记录管理，用于保存和恢复组件状态
  record: Record;
  // 方便外部扩展组件
  abstract type: ComponentType | string;
  // 结构上的作用
  abstract structureType: StructureType;
  // 默认的数据和样式
  data: storeData = {};
  style: storeData = {};

  constructor(style: storeData = {}, data: storeData = {}) {
    super();
    this.decorate = new Decorate(this, style, data);
    this.record = new Record(this);
  }

  destory() {
    this.$off();
  }

  // 获取类型
  getType(): string {
    return this.type;
  }

  // 获取用于存储的内容
  getRaw(): IRawType {
    let raw: IRawType = {
      type: this.type,
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.copyStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.copyData();
    }
    return raw;
  }

  // 修改组件的表现形式
  modifyDecorate(style?: storeData, data?: storeData) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
  }

  // 记录当前状态
  recordSnapshoot() {
    this.$emit("componentSnapshot", this);
  }

  // 获得当前组件的快照，用于撤销和回退
  snapshoot(): ISnapshoot {
    return {
      style: this.decorate.style,
      data: this.decorate.data,
    };
  }

  // 回退组件状态
  restore(state: ISnapshoot) {
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }

  // 渲染该组件
  render(contentBuilder: BaseBuilder, onlyDecorate: boolean = false): any {
    throw createError("请为组件添加 render 函数");
  }

  // 将事件进行冒泡
  $emit<T>(eventName: string, event?: T, ...rest: any[]) {
    super.$emit(eventName, event, ...rest);
    if (this.parent) {
      this.parent.$emit(eventName, event, ...rest);
    }
    return this;
  }
}

export default Component;
