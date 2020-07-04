import { getComponentFactory } from ".";
import Component, {
  operatorType,
  classType,
  IRawType,
  ISnapshoot
} from "./component";
import Block, { IBlockSnapshoot } from "./block";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { createError } from "./util";
import { storeData } from "../decorate";
import { recordMethod } from "../record/decorators";

export interface IPlainTextSnapshoot extends IBlockSnapshoot {
  content: string;
}

abstract class PlainText extends Block {
  content: string;
  structureType = StructureType.plainText;

  static exchangeOnly(component: Component, args: any[] = []): PlainText[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  static exchange(
    block: Block,
    args: any[],
    customerUpdate: boolean = false
  ): PlainText[] {
    let parent = block.parent;
    if (!parent) throw createError("该节点已失效", block);
    let prev = parent.getPrev(block);
    if (prev instanceof PlainText) {
      prev.receive(block, customerUpdate);
      return [prev];
    } else {
      let newItem = this.exchangeOnly(block, args);
      let index = parent.findChildrenIndex(block);
      block.removeSelf();
      parent.add(newItem, index, customerUpdate);
      return newItem;
    }
  }

  constructor(
    content: string = "",
    style: storeData = {},
    data: storeData = {}
  ) {
    super(style, data);
    // 纯文本最后必须有一个换行
    if (content[content.length - 1] !== "\n") {
      content += "\n";
    }
    this.decorate.setStyle("overflow", "auto");
    this.content = content;
  }

  //  忽略最后一个换行符
  getSize() {
    return this.content.length - 1;
  }

  @recordMethod
  exchangeTo(builder: classType, args: any[]): Block[] {
    return builder.exchange(this, args);
  }

  @recordMethod
  add(
    string: string,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (typeof string !== "string") {
      throw createError("纯文本组件只能输入文字");
    }
    index = index === undefined ? this.content.length : index;
    this.content =
      this.content.slice(0, index) + string + this.content.slice(index);
    updateComponent(this, customerUpdate);
    return [this, index + string.length, index + string.length];
  }

  @recordMethod
  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (end === undefined) end = this.content.length;
    if (start < 0 && end === 0) {
      if (this.content.length <= 1) {
        return this.replaceSelf(getComponentFactory().buildParagraph());
      }
      return;
    }
    this.content = this.content.slice(0, start) + this.content.slice(end);
    updateComponent(this, customerUpdate);
    return [this, start, start];
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    if (block) {
      throw createError("纯文本组件只能输入文字");
    }
    return this.add("\n", index, customerUpdate);
  }

  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    block?.removeSelf();
    let size = this.content.length;
    if (block instanceof ContentCollection) {
      this.add(block.children.map((item) => item.content).join("") + "\n");
    } else if (block instanceof PlainText) {
      this.add(block.content);
    }
    return [this, size, size];
  }

  addEmptyParagraph(bottom: boolean = true): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let index = parent.findChildrenIndex(this);
    let paragraph = getComponentFactory().buildParagraph();
    parent.add(paragraph, index + (bottom ? 1 : 0));
    return [paragraph, 0, 0];
  }

  snapshoot(): IPlainTextSnapshoot {
    let snap = super.snapshoot() as IPlainTextSnapshoot;
    snap.content = this.content;
    return snap;
  }

  restore(state: IPlainTextSnapshoot) {
    this.content = state.content;
    super.restore(state);
  }

  getStatistic() {
    let res = super.getStatistic();
    res.word = this.content.length;
    return res;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.content = this.content;
    return raw;
  }
}

export default PlainText;
