import { eq } from "lodash-es";
import Decorate, { storeData } from "../decorate";
import { operatorType, classType, IRawType } from "./component";
import Block from "./block";
import Collection from "./collection";
import Inline from "./inline";
import InlineImage from "./inline-image";
import Character from "./character";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { createError } from "./util";
import { getContentBuilder } from "../content";
import { recordMethod } from "../record/decorators";

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

  createEmpty(): ContentCollection {
    throw createError("组件缺少 createEmpty 方法", this);
  }

  exchangeTo(builder: classType, args: any[]): Block[] {
    return builder.exchange(this, args);
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
  removeChildren(
    inline: Inline | number,
    index?: number,
    customerUpdate: boolean = false
  ) {
    let removed = super.removeChildren(inline, index);
    updateComponent(this, customerUpdate);
    return removed;
  }

  splitChild(
    index: number,
    customerUpdate: boolean = false
  ): ContentCollection {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效，不能分割", this);
    let isTail = index === this.getSize();
    let tail = isTail ? [] : this.children.slice(index).toArray();
    if (!isTail) {
      this.removeChildren(index, this.getSize() - index, customerUpdate);
    }
    let thisIndex = parent.findChildrenIndex(this);
    let newCollection = this.createEmpty();
    if (!isTail) {
      newCollection.addChildren(tail, 0, true);
    }
    return parent.addChildren(
      [newCollection],
      thisIndex + 1,
      customerUpdate
    )[0] as ContentCollection;
  }

  split(
    index: number,
    block?: Block | Block[],
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
    let componentIndex = parent.findChildrenIndex(this);
    let splitBlock = this.splitChild(index, customerUpdate);
    if (block) {
      if (!Array.isArray(block)) block = [block];
      let newChildren = parent.addChildren(
        block,
        componentIndex + 1,
        customerUpdate
      );
      if (this.isEmpty()) {
        this.removeSelf();
      }
      if (splitBlock.isEmpty()) {
        splitBlock.removeSelf();
        return [newChildren[block.length - 1], 0, 0];
      }
    }
    return [splitBlock, 0, 0];
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
          new Character(char, decorate?.getStyle(), decorate?.getData())
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

  remove(
    start: number,
    end?: number,
    customerUpdate: boolean = false
  ): operatorType {
    let parent = this.parent;
    if (!parent) throw createError("该节点已失效", this);
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
      this.children.get(i)?.modifyDecorate(style, data);
    }
    updateComponent(this, customerUpdate);
    return [this, start, end];
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
        prevDecorate.styleIsEmpty() ? undefined : prevDecorate.getStyle(),
        prevDecorate.dataIsEmpty() ? undefined : prevDecorate.getData()
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
      raw.style = this.decorate.getStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.getData();
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
}

export default ContentCollection;
