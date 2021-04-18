import { v4 as uuidv4 } from "uuid";
import Editor from "../editor";
import ComponentFactory, { getDefaultComponentFactory } from ".";
import Component, { OperatorType, RawType, Snapshoot } from "./component";
import StructureCollection from "./structure-collection";
import nextTick from "../util/next-tick";
import { AnyObject } from "../decorate/index";
import { createError } from "../util/handle-error";

export type BlockType = typeof Block;
export interface BlockSnapshoot extends Snapshoot {
  active: boolean;
}

abstract class Block extends Component {
  // 否是有效的
  active: boolean = false;
  // 父组件
  parent?: StructureCollection<Block>;
  // 组件所属的编辑器
  editor?: Editor;

  // 根据 raw 保存的内容恢复组件
  static create(componentFactory: ComponentFactory, raw: RawType): Component {
    throw createError("组件未实现 create 静态方法", this);
  }

  // 将别的组件转换为当前组件类型
  static exchange(componentFactory: ComponentFactory, component: Component, args?: any[]): Block[] {
    throw createError("组件未实现 exchange 静态方法", this);
  }

  constructor(style?: AnyObject, data?: AnyObject) {
    super(style, data);

    // 事件需在下一微任务触发，原因如下：
    // 事件冒泡到 Article 中才有效，而 model 的更改是一次同步任务
    // 只有加入到 Article 中的组件才是有效的组件，但组件创建之后，并不需要一定加入到 article 中
    nextTick(() => {
      this.$emit("blockCreated", this);
    });

    this.init();
  }

  // 提供一个初始化的方法，避免继承需要重写 constructor 方法
  init(): void {}

  // 将当前组件转换为 builder 类型的组件
  exchangeTo(builder: BlockType, args: any[]): Block[] {
    if (builder === this.constructor) {
      return [this];
    }

    return builder.exchange(this.getComponentFactory(), this, args);
  }

  // 添加到某个组件内，被添加的组件必须为 StructureCollection 类型
  addInto(collection: StructureCollection<Block>, index: number = -1): OperatorType {
    return collection.add(index, this);
  }

  // 从其父组件内移除
  removeSelf(): OperatorType {
    let parent = this.getParent();
    let index = parent.findChildrenIndex(this);
    return parent.remove(index, index + 1);
  }

  // 替换为另一个组件
  replaceSelf(...blockList: Block[]): OperatorType {
    let parent = this.getParent();
    parent.replaceChild(blockList, this);
    return [{ id: blockList[0].id, offset: 0 }];
  }

  // 修改组件的表现形式
  modifyDecorate(style?: AnyObject, data?: AnyObject) {
    this.componentWillChange();
    super.modifyDecorate(style, data);
    this.updateComponent([this]);
    return;
  }

  // 修改子组件的表现形式，仅在 ContentCollection 组件内有效
  modifyContentDecorate(start: number, end: number, style?: AnyObject, data?: AnyObject) {
    return;
  }

  // 在一些组件中 Enter 被使用，导致不能在组件下方或上方创建新行
  // 使用该 api 创建上方或是下方的新行
  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    let index = parent.findChildrenIndex(this);
    let paragraph = this.getComponentFactory().buildParagraph();
    parent.add(index + (bottom ? 1 : 0), paragraph);
    return [{ id: paragraph.id, offset: 0 }];
  }

  // 添加子组件
  add(index: number, ...children: (string | Component)[]): OperatorType {
    return;
  }

  // 移除子组件
  remove(start: number, end?: number): OperatorType {
    return;
  }

  // 在 index 处切分组件
  split(index: number, ...componentList: Component[]): OperatorType {
    return;
  }

  // 将自己发送到另一组件
  sendTo(component: Component): OperatorType {
    return;
  }

  // 接收另一组件
  receive(component: Component): OperatorType {
    return;
  }

  destory() {
    this.active = false;
    this.parent = undefined;
    super.destory();
  }

  setEditor(editor?: Editor) {
    this.editor = editor;
  }

  // 判断该组件是否为空，为空并不代表无效
  isEmpty(): boolean {
    return true;
  }

  // 创建一个空的当前组件
  createEmpty(): Block {
    throw createError("组件未实现 createEmpty 方法", this);
  }

  clone(): Block {
    let newBlock = { ...this };
    newBlock.style = {
      ...this.style,
    };
    newBlock.data = {
      ...this.data,
    };

    Object.setPrototypeOf(newBlock, Object.getPrototypeOf(this));
    newBlock.id = uuidv4();
    nextTick(() => {
      newBlock.$emit("blockCreated", newBlock);
    });
    return newBlock;
  }

  // 获取父节点
  getParent() {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    return parent;
  }

  // 获取子组件的长度
  getSize(): number {
    return 0;
  }

  getComponentFactory() {
    return this.editor ? this.editor.componentFactory : getDefaultComponentFactory();
  }
}

export default Block;
