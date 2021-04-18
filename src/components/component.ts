import { Map } from "immutable";
import Event from "./event";
import { v4 as uuidv4 } from "uuid";
import Decorate, { AnyObject } from "../decorate";
import Record from "../record";
import Collection from "./collection";
import BaseView from "../view/base-view";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { Cursor } from "../selection/util";
import { ListEnum } from "./list";
import { HeadingEnum } from "./heading";
import { TableCellEnum } from "./table";

export type OperatorType = [Cursor?, Cursor?] | undefined;

export interface RawType {
  id?: string;
  type: ComponentType | string;
  children?: RawType[];
  style?: AnyObject;
  data?: AnyObject;
  // for CharacterList
  content?: string;
  // for Media or InlineImage
  src?: string;
  // for Media
  mediaType?: string;
  // fro Heading
  headingType?: HeadingEnum;
  // for List
  listType?: ListEnum;
  // for TableRow
  cellType?: TableCellEnum;
  size?: number;
  // for CodeBlock
  language?: string;
  // for CustomCollection
  tag?: string;
}

export interface Snapshoot {
  style: Map<string, string>;
  data: Map<string, string>;
}

abstract class Component extends Event {
  id: string = uuidv4();
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
  data: AnyObject = {};
  style: AnyObject = {};

  constructor(style: AnyObject = {}, data: AnyObject = {}) {
    super();
    this.decorate = new Decorate(this, style, data);
    this.record = new Record(this);
  }

  // 修改组件的表现形式
  modifyDecorate(style?: AnyObject, data?: AnyObject) {
    this.decorate.mergeStyle(style);
    this.decorate.mergeData(data);
  }

  // 获得当前组件的快照，用于撤销和回退
  snapshoot(): Snapshoot {
    return {
      style: this.decorate.style,
      data: this.decorate.data,
    };
  }

  // 回退组件状态
  restore(state: Snapshoot) {
    this.decorate.style = state.style;
    this.decorate.data = state.data;
  }

  // 获取类型
  getType(): string {
    return this.type;
  }

  // 获取用于存储的内容
  getRaw(): RawType {
    let raw: RawType = {
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

  destory() {
    this.$off();
  }

  // 渲染该组件
  abstract render(contentView: BaseView): any;

  componentWillChange() {
    this.$emit("componentWillChange", this);
  }

  updateComponent(componentList: Component[]) {
    this.$emit("updateComponent", componentList);
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
