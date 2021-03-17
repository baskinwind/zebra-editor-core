import ComponentFactory from ".";
import Component, { OperatorType, IRawType } from "./component";
import Block, { IBlockSnapshoot } from "./block";
import ContentCollection from "./content-collection";
import StructureType from "../const/structure-type";
import { StoreData } from "../decorate";
import { createError } from "../util/handle-error";
import Character from "./character";

export interface IPlainTextSnapshoot extends IBlockSnapshoot {
  content: string;
}

abstract class PlainText extends Block {
  content: string[];
  structureType = StructureType.plainText;

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

  add(string: string, index?: number): OperatorType {
    if (typeof string !== "string") {
      throw createError("纯文本组件仅能输入文字", this);
    }

    index = index === undefined ? this.content.length : index;
    let addString = [...string];
    this.content.splice(index, 0, ...addString);
    this.$emit("componentUpdated", [this]);

    return [[this], { id: this.id, offset: index + addString.length }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    // 首位删除变成空行
    if (start < 0 && end === 0) {
      return this.replaceSelf(this.getComponentFactory().buildParagraph());
    }

    this.content.splice(start, end - start);
    this.$emit("componentUpdated", [this]);
    return [[this], { id: this.id, offset: start }];
  }

  split(index: number, block?: Block | Block[]): OperatorType {
    if (block) {
      throw createError("纯文本组件仅能输入文字", this);
    }

    return this.add("\n", index);
  }

  receive(block: Block): OperatorType {
    block.removeSelf();
    let size = this.content.length;

    // 内容集合组件添加其中的文字内容
    if (block instanceof ContentCollection) {
      this.add(
        block.children
          .filter((item) => item instanceof Character)
          .map((item) => item.content)
          .join("") + "\n",
      );
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

  getSize() {
    return this.content.length - 1;
  }

  getRaw(): IRawType {
    let raw = super.getRaw();
    raw.content = this.content.join("");
    return raw;
  }
}

export default PlainText;
