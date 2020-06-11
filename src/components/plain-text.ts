import Component, { operatorType, classType, rawType } from "./component";
import Block from "./block";
import ContentCollection from "./content-collection";
import Paragraph from "./paragraph";
import StructureType from "../const/structure-type";
import DirectionType from "../const/direction-type";
import updateComponent from "../util/update-component";
import { createError } from "./util";
import { storeData } from "../decorate";

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

  exchangeTo(builder: classType, args: any[]): Component[] {
    return builder.exchange(this, args);
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

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    if (end === undefined) end = this.content.length;
    if (start < 0 && end === 0) {
      if (this.content.length <= 1) {
        return this.replaceSelf(new Paragraph());
      }
      return;
    }
    this.content = this.content.slice(0, start) + this.content.slice(end);
    updateComponent(this, customerUpdate);
    return [this, start, start];
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

  // 在纯文本中 Enter 被用作换行，导致不能创建新行，光标会被困在 Code 区域内
  // 当在 Code 的第一行，按下向上时，若该 Code 为 Article 的第一个子元素，则在 Code 上生成新行
  // 向下操作为向上的反向
  handleArrow(index: number, direction: DirectionType): operatorType {
    let contentList = this.content.split("\n");
    if (direction === DirectionType.up && index <= contentList[0].length) {
      let parent = this.parent;
      if (!parent) throw createError("该节点已失效", this);
      let index = parent.findChildrenIndex(this);
      if (index !== 0) {
        return [parent.children.get(index - 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, 0);
      return [paragraph, 0, 0];
    }
    if (
      direction === DirectionType.down &&
      index > this.content.length - contentList[contentList.length - 2].length
    ) {
      let parent = this.parent;
      if (!parent) throw createError("该节点已失效", this);
      let index = parent.findChildrenIndex(this);
      if (index !== parent.getSize() - 1) {
        return [parent.children.get(index + 1) as Component, 0, 0];
      }
      let paragraph = new Paragraph();
      this.parent?.add(paragraph, parent.getSize());
      return [paragraph, 0, 0];
    }
    return;
  }

  getRaw(): rawType {
    let raw = super.getRaw();
    raw.content = this.content;
    return raw;
  }
}

export default PlainText;
