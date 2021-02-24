import Decorate, { storeData } from "../decorate";
import { operatorType, IRawType } from "./component";
import Block from "./block";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import ComponentFactory from ".";
import ComponentType from "../const/component-type";
import BaseBuilder from "../content/base-builder";
import StructureType from "../const/structure-type";
import updateComponent from "../util/update-component";
import { createError } from "../util/handle-error";

abstract class ContentCollection extends Collection<Inline> {
  structureType = StructureType.content;

  static getChildren(
    componentFactory: ComponentFactory,
    raw: IRawType,
  ): Inline[] {
    if (!raw.children) return [];
    let children: Inline[] = [];
    raw.children.forEach((item: IRawType) => {
      if (componentFactory.typeMap[item.type]) {
        children.push(componentFactory.typeMap[item.type].create(item));
        return;
      }
      if (!item.content) return;
      for (let char of item.content) {
        children.push(new Character(char, item.style, item.data));
      }
      return;
    });
    return children;
  }

  static exchangeOnly(
    componentFactory: ComponentFactory,
    block: Block,
    args?: any[],
  ): ContentCollection[] {
    throw createError("组件未实现 exchangeOnly 静态方法", this);
  }

  static exchange(
    componentFactory: ComponentFactory,
    block: Block,
    args: any[],
  ): ContentCollection[] {
    let newContent = this.exchangeOnly(componentFactory, block, args);
    block.replaceSelf(newContent);
    return newContent;
  }

  constructor(text: string = "", style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text, 0);
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
  ): operatorType {
    end = end < 0 ? this.getSize() + end : end;
    if (start > end || (!style && !data)) {
      return [[this], { id: this.id, offset: start }];
    }

    for (let i = start; i <= end; i++) {
      this.getChild(i)?.modifyDecorate(style, data);
    }

    updateComponent(this.editor, this);
    return [
      [this],
      { id: this.id, offset: start },
      { id: this.id, offset: end },
    ];
  }

  addChildren(inline: Inline[], index?: number) {
    inline
      .filter((item) => item instanceof Inline)
      .forEach((item) => {
        item.parent = this;
      });

    let added = super.addChildren(inline, index);
    updateComponent(this.editor, this);
    return added;
  }

  add(inline: Inline[] | Inline | string, index?: number): operatorType {
    index = index !== undefined ? index : this.getSize();

    if (typeof inline === "string") {
      let decorate = this.children.get(index === 0 ? 0 : index - 1)?.decorate;
      let list = [];
      for (let char of inline) {
        list.push(
          new Character(char, decorate?.copyStyle(), decorate?.copyData()),
        );
      }
      inline = list;
    }

    if (!Array.isArray(inline)) {
      inline = [inline];
    }
    this.addChildren(inline, index);
    return [[this], { id: this.id, offset: index + inline.length }];
  }

  removeChildren(inline: Inline | number, index?: number) {
    let removed = super.removeChildren(inline, index);
    updateComponent(this.editor, this);
    return removed;
  }

  remove(start: number, end?: number): operatorType {
    let parent = this.getParent();
    if (end === undefined) end = this.getSize();
    if (start < 0 && end === 0) {
      let index = parent.findChildrenIndex(this);
      return parent.childHeadDelete(this, index);
    }
    end = end < 0 ? this.getSize() + end : end;
    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }
    this.removeChildren(start, end - start);
    return [[this], { id: this.id, offset: start }];
  }

  splitChild(index: number): ContentCollection {
    let isTail = index === this.getSize();
    // 如果是从中间分段，则保持段落类型
    if (!isTail) {
      let tail = this.children.slice(index).toArray();
      this.removeChildren(index, this.getSize() - index);
      let newCollection = this.createEmpty();
      newCollection.add(tail, 0);
      return newCollection;
    }
    // 如果是从尾部分段，则直接添加一个普通段落
    let newParagraph = this.getComponentFactory().buildParagraph();
    return newParagraph;
  }

  split(index: number, block?: Block | Block[]): operatorType {
    let parent = this.getParent();
    let splitBlock = this.splitChild(index);
    let blockIndex = parent.findChildrenIndex(this);
    if (!block || splitBlock.getSize() !== 0) {
      parent.add(splitBlock, blockIndex + 1);
    }
    if (block) {
      if (!Array.isArray(block)) block = [block];
      parent.add(block, blockIndex + 1);
    }
    return [[this], { id: this.id, offset: index }];
  }

  addText(text: string, index?: number): operatorType {
    index = index ? index : this.getSize();
    let charList: Character[] = [];
    for (let char of text) {
      charList.push(new Character(char));
    }
    this.addChildren(charList, index);
    return [[this], { id: this.id, offset: index + text.length }];
  }

  addEmptyParagraph(bottom: boolean): operatorType {
    let parent = this.getParent();
    if (parent.type === ComponentType.article) {
      return super.addEmptyParagraph(bottom);
    }
    return parent.addEmptyParagraph(bottom);
  }

  sendTo(block: Block): operatorType {
    return block.receive(this);
  }

  receive(block?: Block): operatorType {
    let size = this.getSize();
    if (!block) return [[this], { id: this.id, offset: size }];
    block.removeSelf();

    if (block instanceof ContentCollection) {
      this.children = this.children.push(...block.children);
      updateComponent(this.editor, this);
    }
    return [[this], { id: this.id, offset: size }];
  }

  fromatChildren() {
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: Decorate;

    let createCharacterList = () => {
      if (!acc.length) return;
      content.push([
        acc.map((character) => character.content).join(""),
        prevDecorate.styleIsEmpty() ? undefined : prevDecorate.copyStyle(),
        prevDecorate.dataIsEmpty() ? undefined : prevDecorate.copyData(),
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
      // @ts-ignore
      // 字符无需特定的 type 生成 JSON 时，这段重复出现，占据比例极大，优化
      let raw: IRawType = {
        content: item[0],
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
      children: children,
    };
    if (!this.decorate.styleIsEmpty()) {
      raw.style = this.decorate.copyStyle();
    }
    if (!this.decorate.dataIsEmpty()) {
      raw.data = this.decorate.copyData();
    }
    return raw;
  }

  getContent(contentBuilder: BaseBuilder) {
    return this.fromatChildren().map((item, index) => {
      if (item.render) {
        return item.render(contentBuilder);
      }
      return contentBuilder.buildCharacterList(
        `${this.id}__${index}`,
        item[0],
        item[1] || {},
        item[2] || {},
      );
    });
  }
}

export default ContentCollection;
