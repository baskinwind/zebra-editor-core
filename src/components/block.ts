import { v4 as uuidv4 } from "uuid";
import Editor from "../editor";
import Component, { OperatorType, JSONType, Snapshoot } from "./component";
import ComponentFactory, { getDefaultComponentFactory } from "../factory";
import { AnyObject } from "../decorate/index";
import StructureCollection from "./structure-collection";
import { createError } from "../util";

export type BlockType = typeof Block;
export interface BlockSnapshoot extends Snapshoot {
  active: boolean;
}

abstract class Block extends Component {
  active: boolean = false;
  parent?: StructureCollection<Block>;
  editor?: Editor;

  static create(componentFactory: ComponentFactory, json: JSONType): Component {
    throw createError("component need implement static create method", this);
  }

  // 将别的组件转换为当前组件类型
  static exchange(componentFactory: ComponentFactory, component: Component, args?: any[]): Block[] {
    throw createError("component need implement static exchange method", this);
  }

  constructor() {
    super();

    this.init();
  }

  init(): void {}

  exchangeTo(builder: BlockType, args: any[] = []): Block[] {
    if (builder === this.constructor) {
      return [this];
    }

    return builder.exchange(this.getComponentFactory(), this, args);
  }

  addInto(collection: StructureCollection<Block>, index: number = -1): OperatorType {
    return collection.add(index, this);
  }

  removeSelf(): OperatorType {
    let parent = this.getParent();
    let index = parent.findChildrenIndex(this);
    return parent.remove(index, index + 1);
  }

  replaceSelf(...blockList: Block[]): OperatorType {
    let parent = this.getParent();
    parent.replaceChild(blockList, this);
    return [{ id: blockList[0].id, offset: 0 }];
  }

  modifyDecorate(style?: AnyObject, data?: AnyObject) {
    this.componentWillChange();
    super.modifyDecorate(style, data);
    this.updateComponent([this]);
    return;
  }

  modifyContentDecorate(start: number, end: number, style?: AnyObject, data?: AnyObject) {
    return;
  }

  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();
    let index = parent.findChildrenIndex(this);
    let paragraph = this.getComponentFactory().buildParagraph();
    parent.add(index + (bottom ? 1 : 0), paragraph);
    return [{ id: paragraph.id, offset: 0 }];
  }

  add(index: number, ...children: (string | Component)[]): OperatorType {
    return;
  }

  remove(start: number, end?: number): OperatorType {
    return;
  }

  split(index: number, ...componentList: Component[]): OperatorType {
    return;
  }

  sendTo(component: Component): OperatorType {
    return;
  }

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

  isEmpty(): boolean {
    return true;
  }

  createEmpty(): Block {
    throw createError("component need implement createEmpty method.", this);
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
    return newBlock;
  }

  getParent() {
    let parent = this.parent;
    if (!parent) throw createError("the node has expired.", this);
    return parent;
  }

  getSize(): number {
    return 0;
  }

  getComponentFactory() {
    return this.editor ? this.editor.componentFactory : getDefaultComponentFactory();
  }
}

export default Block;
