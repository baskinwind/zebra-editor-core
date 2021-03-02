import ComponentFactory from ".";
import Component, { OperatorType, IRawType } from "./component";
import Block, { IBlockSnapshoot } from "./block";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { StoreData } from "../decorate";
import { createError } from "../util/handle-error";

export interface IPlainTextSnapshoot extends IBlockSnapshoot {
  content: string;
}

abstract class PlainText extends Block {
  content: string[];
  structureType = StructureType.plainText;
  style: StoreData = {
    overflow: "auto",
  };

  static exchangeOnly(
    componentFactory: ComponentFactory,
    component: Component,
    args: any[] = [],
  ): PlainText[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[],
  ): PlainText[] {
    let parent = block.getParent();
    let prev = parent.getPrev(block);
    if (prev instanceof PlainText) {
      prev.receive(block);
      return [prev];
    } else {
      let newItem = this.exchangeOnly(componentFactory, block, args);
      block.replaceSelf(newItem);
      return newItem;
    }
  }

  constructor(
    content: string = "",
    style: StoreData = {},
    data: StoreData = {},
  ) {
    super(style, data);
    // 纯文本最后必须有一个换行，js 中 emoji 的长度识别有问题
    this.content = [...content];
    if (this.content[this.content.length - 1] !== "\n") {
      this.content.push("\n");
    }
  }

  getSize() {
    return this.content.length - 1;
  }

  getStatistic() {
    let res = super.getStatistic();
    res.word = this.content.length;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.content = this.content.join("");
    return raw;
  }

  add(string: string, index?: number): OperatorType {
    if (typeof string !== "string") {
      throw createError("纯文本组件仅能输入文字", this);
    }

    index = index === undefined ? this.content.length : index;
    let addString = [...string];
    this.content.splice(index, 0, ...addString);
    updateComponent(this.editor, this);

    return [[this], { id: this.id, offset: index + addString.length }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    // 首位删除变成空行
    if (start < 0 && end === 0) {
      return this.replaceSelf(this.getComponentFactory().buildParagraph());
    }

    this.content.splice(start, end - start);
    updateComponent(this.editor, this);
    return [[this], { id: this.id, offset: start }];
  }

  split(index: number, block?: Block | Block[]): OperatorType {
    if (block) {
      throw createError("纯文本组件仅能输入文字", this);
    }

    return this.add("\n", index);
  }

  receive(block?: Block): OperatorType {
    block?.removeSelf();
    let size = this.content.length;

    // 内容集合组件添加其中的文字内容
    if (block instanceof ContentCollection) {
      // TODO: 需要判断是否是图片
      this.add(block.children.map((item) => item.content).join("") + "\n");
      // 纯文本组件直接合并
    } else if (block instanceof PlainText) {
      this.content.push(...block.content);
    }

    return [[this], { id: this.id, offset: size }];
  }

  snapshoot(): IPlainTextSnapshoot {
    let snap = super.snapshoot() as IPlainTextSnapshoot;
    snap.content = this.content.join("");
    return snap;
  }

  restore(state: IPlainTextSnapshoot) {
    this.content = [...state.content];
    super.restore(state);
  }
}

export default PlainText;
