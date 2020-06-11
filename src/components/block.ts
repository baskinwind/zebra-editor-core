import Component, { classType, operatorType } from "./component";
import StructureCollection from "./structure-collection";
import DirectionType from "../const/direction-type";
import { saveComponent, createError } from "./util";
import { storeData } from "../decorate/index";
import Collection from "./collection";

abstract class Block extends Component {
  // 否是有效的
  active: boolean = false;
  parent?: StructureCollection<Block>;

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
    super(style, data);
    saveComponent(this);
  }

  // 判断该组件是否为空，为空并不代表无效
  isEmpty(): boolean {
    return false;
  }

  getSize(): number {
    return 0;
  }

  // 创建一个空的当前组件
  createEmpty(): Component {
    throw createError("组件未实现 createEmpty 方法", this);
  }

  // 将当前组件转换为 builder 类型的组件
  exchangeTo(builder: classType, args: any[]): Component[] {
    throw createError("组件未实现 exchangeTo 方法", this);
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
    component: Block | Block[],
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

  // 将自己发送到另一组件
  sendTo(component: Component, customerUpdate: boolean = false): operatorType {
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
}

export default Block;
