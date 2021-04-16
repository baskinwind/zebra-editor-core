import ComponentFactory from ".";
import Component, { OperatorType, RawType } from "./component";
import Block, { BlockSnapshoot } from "./block";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import { AnyObject } from "../decorate";
import { createError } from "../util/handle-error";
import Character from "./character";
import ComponentType from "../const/component-type";
import { getUtf8TextLengthFromJsOffset } from "../util/text-util";

export interface PlainTextSnapshoot extends BlockSnapshoot {
  content: string;
}

abstract class PlainText extends Block {
  content: string[];
  structureType = StructureType.plainText;

  constructor(content: string = "", style: AnyObject = {}, data: AnyObject = {}) {
    super(style, data);
    // 纯文本最后必须有一个换行，js 中 emoji 的长度识别有问题
    this.content = [...content];
    if (this.content[this.content.length - 1] !== "\n") {
      this.content.push("\n");
    }
  }

  add(index: number, string: string): OperatorType {
    if (typeof string !== "string") {
      throw createError("纯文本组件仅能输入文字", this);
    }

    index = index === undefined ? this.content.length : index;
    this.willChange();
    this.content.splice(index, 0, ...string);
    this.updateComponent([this]);

    return [{ id: this.id, offset: index + getUtf8TextLengthFromJsOffset(string) }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    this.willChange();
    // 首位删除变成段落
    if (start < 0 && end === 0) {
      let block = this.exchangeTo(this.getComponentFactory().typeMap[ComponentType.paragraph], []);
      return [{ id: block[0].id, offset: 0 }];
    }

    this.content.splice(start, end - start);
    this.updateComponent([this]);
    return [{ id: this.id, offset: start }];
  }

  split(index: number, ...blockList: Block[]): OperatorType {
    if (blockList.length) {
      throw createError("纯文本组件仅能输入文字", this);
    }

    return this.add(index, "\n");
  }

  receive(block: Block): OperatorType {
    block.removeSelf();
    let size = this.content.length;

    // 内容集合组件添加其中的文字内容
    if (block instanceof ContentCollection) {
      this.add(
        -1,
        block.children
          .filter((each) => each instanceof Character)
          .map((each) => each.content)
          .join("") + "\n",
      );
      // 纯文本组件直接合并
    } else if (block instanceof PlainText) {
      this.content.push(...block.content);
    }

    return [{ id: this.id, offset: size }];
  }

  snapshoot(): PlainTextSnapshoot {
    let snap = super.snapshoot() as PlainTextSnapshoot;
    snap.content = this.content.join("");
    return snap;
  }

  restore(state: PlainTextSnapshoot) {
    this.content = [...state.content];
    super.restore(state);
  }

  getSize() {
    return this.content.length - 1;
  }

  getRaw(): RawType {
    let raw = super.getRaw();
    raw.content = this.content.join("");
    return raw;
  }
}

export default PlainText;
