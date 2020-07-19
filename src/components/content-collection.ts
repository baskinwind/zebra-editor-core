import Decorate, { storeData } from "../decorate";
import { operatorType, IRawType } from "./component";
import Block from "./block";
import Collection from "./collection";
import Inline from "./inline";
import InlineImage from "./inline-image";
import Character from "./character";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { getContentBuilder } from "../content";
import { recordMethod } from "../record/decorators";
import { getComponentFactory } from ".";
import { createError } from "../util/handle-error";

abstract class ContentCollection extends Collection<Inline> {
  structureType = StructureType.content;

  static getChildren(raw: IRawType): Inline[] {
    if (!raw.children) return [];
    let children: Inline[] = [];
    raw.children.forEach((item: IRawType) => {
      if (item.type === ComponentType.characterList) {
        if (!item.content) return;
        for (let char of item.content) {
          children.push(new Character(char, item.style, item.data));
        }
        return;
      }
      if (item.type === ComponentType.inlineImage) {
        children.push(InlineImage.create(item));
        return;
      }
    });
    return children;
  }

  static exchangeOnly(block: Block, args?: any[]): ContentCollection[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  static exchange(
    block: Block,
    args: any[],
    customerUpdate: boolean = false
  ): ContentCollection[] {
    let newContent = this.exchangeOnly(block, args);
    block.replaceSelf(newContent, customerUpdate);
    return newContent;
  }

  constructor(text: string = "", style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text, 0, true);
    }
  }

  getStatistic() {
    let res = super.getStatistic();
    this.children.forEach((item) => {
      if (item instanceof Character) {
        res.word += 1;
      } else {
        res.image += 1;
      }
    });
    res.block += 1;
    return res;
  }

  createEmpty(): ContentCollection {
    throw createError("组件缺少 createEmpty 方法", this);
  }

  modifyContentDecorate(
    start: number = 0,
    end: number = -1,
    style?: storeData,
    data?: storeData,
    customerUpdate: boolean = false
  ) {
    end = end < 0 ? this.getSize() + end : end;
    if (start > end) return;
    if (!style && !data) return;
    for (let i = start; i <= end; i++) {
      this.getChild(i)?.modifyDecorate(style, data);
    }
    updateComponent(this, customerUpdate);
    return [this, start, end];
  }

  addChildren(
    inline: Inline[],
    index?: number,
    customerUpdate: boolean = false
  ) {
    inline
      .filter((item) => item instanceof Inline)
      .forEach((item) => {
        item.parent = this;
      });
    let res = super.addChildren(inline, index);
    updateComponent(this, customerUpdate);
    return res;
  }

  add(
    inline: Inline[] | Inline | string,
    index?: number,
    customerUpdate: boolean = false
  ): operatorType {
    index = index !== undefined ? index : this.getSize();
    if (typeof inline === "string") {
      let decorate = this.children.get(index === 0 ? 0 : index - 1)?.decorate;
      let list = [];
      for (let char of inline) {
        list.push(
          new Character(char, decorate?.copyStyle(), decorate?.copyData())
        );
      }
      inline = list;
    }
    if (!Array.isArray(inline)) {
      inline = [inline];
    }
    this.addChildren(inline, index, customerUpdate);
    return [this, index + inline.length, index + inline.length];
  }

  removeChildren(
    inline: Inline | number,
    index?: number,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(inline, index);
    updateComponent(this, customerUpdate);
    return removed;
  }

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    if (end === undefined) end = this.getSize();
    if (start < 0 && end === 0) {
      let index = parent.findChildrenIndex(this);
      return parent.childHeadDelete(this, index, customerUpdate);
    }
    end = end < 0 ? this.getSize() + end : end;
    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
    this.removeChildren(start, end - start, customerUpdate);
    return [this, start, start];
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): ContentCollection {
    let isTail = index === this.getSize();
    // 如果是从中间分段，则保持段落类型
    if (!isTail) {
      let tail = this.children.slice(index).toArray();
      this.removeChildren(index, this.getSize() - index, customerUpdate);
      let newCollection = this.createEmpty();
      newCollection.add(tail, 0, true);
      return newCollection;
    }
    // 如果是从尾部分段，则直接添加一个普通段落
    let newParagraph = getComponentFactory().buildParagraph();
    return newParagraph;
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.getParent();
    let splitBlock = this.splitChild(index, customerUpdate);
    let blockIndex = parent.findChildrenIndex(this);
    let focus;
    if (!block || splitBlock.getSize() !== 0) {
      focus = parent.add(splitBlock, blockIndex + 1);
    }
    if (block) {
      if (!Array.isArray(block)) block = [block];
      focus = parent.add(block, blockIndex + 1, customerUpdate);
      if (this.isEmpty()) {
        this.removeSelf();
      }
    }
    return focus;
  }

  addText(text: string, index?: number, customerUpdate: boolean = false) {
    let charList: Character[] = [];
    for (let char of text) {
      charList.push(new Character(char));
    }
    this.addChildren(charList, index, customerUpdate);
    index = index ? index : this.getSize();
    return [this, index + text.length, index + text.length];
  }

  addEmptyParagraph(bottom: boolean): operatorType {
    let parent = this.getParent();
    if (parent.type === ComponentType.article) {
      return super.addEmptyParagraph(bottom);
    }
    return parent.addEmptyParagraph(bottom);
  }

  sendTo(block: Block, customerUpdate: boolean = false): operatorType {
    return block.receive(this, customerUpdate);
  }

  @recordMethod
  receive(block?: Block, customerUpdate: boolean = false): operatorType {
    let size = this.getSize();
    if (!block) return [this, size, size];
    block.removeSelf(customerUpdate);
    if (block instanceof ContentCollection) {
      this.children = this.children.push(...block.children);
      updateComponent(this, customerUpdate);
      return [this, size, size];
    }
    return;
  }

  fromatChildren() {
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: Decorate;

    let createCharacterList = () => {
      if (!acc.length) return;
      content.push([
        acc.map((character) => character.render()).join(""),
        prevDecorate.styleIsEmpty() ? undefined : prevDecorate.copyStyle(),
        prevDecorate.dataIsEmpty() ? undefined : prevDecorate.copyData()
      ]);
      acc = [];
    };

    this.children.forEach((value) => {
      if (value instanceof Character) {
        let decorate = value.decorate;
        if (!decorate) return;
        if (!decorate.isSame(prevDecorate)) {
          createCharacterList();
          prevDecorate = decorate;
        }
        acc.push(value);
        return;
      }
      createCharacterList();
      content.push(value);
    });
    createCharacterList();
    return content;
  }

  getRaw(): IRawType {
    let children = this.fromatChildren().map((item) => {
      if (item.getRaw) {
        return item.getRaw();
      }
      let raw: IRawType = {
        type: ComponentType.characterList,
        content: item[0]
      };
      if (item[1]) {
        raw.style = item[1];
      }
      if (item[2]) {
        raw.data = item[2];
      }
      return raw;
    });
    let raw: IRawType = {
      type: this.type,
      children: children
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.copyStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.copyData();
    }
    return raw;
  }

  getContent() {
    const builder = getContentBuilder();
    return this.fromatChildren().map((item, index) => {
      if (item.render) {
        return item.render();
      }
      return builder.buildCharacterList(
        `${this.id}__${index}`,
        item[0],
        item[1] || {},
        item[2] || {}
      );
    });
  }
}

export default ContentCollection;
