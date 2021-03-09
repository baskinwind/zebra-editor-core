import Decorate, { StoreData } from "../decorate";
import { OperatorType, IRawType } from "./component";
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

  constructor(text: string = "", style?: StoreData, data?: StoreData) {
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

  modifyContentDecorate(
    start: number = 0,
    end: number = -1,
    style?: StoreData,
    data?: StoreData,
  ): OperatorType {
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

  add(inline: Inline[] | Inline | string, index?: number): OperatorType {
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
    updateComponent(this.editor, this);
    return [[this], { id: this.id, offset: index + inline.length }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    let parent = this.getParent();
    end = end < 0 ? this.getSize() + end : end;

    if (start < 0 && end === 0) {
      return parent.childHeadDelete(this);
    }

    if (start > end) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    this.removeChildren(start, end - start);
    updateComponent(this.editor, this);
    return [[this], { id: this.id, offset: start }];
  }

  splitChild(index: number): ContentCollection {
    let isTail = index === this.getSize();

    // 如果是从中间分段，则保持段落类型
    if (!isTail) {
      let tail = this.children.slice(index).toArray();
      this.removeChildren(index, this.getSize() - index);
      let newCollection = this.createEmpty() as ContentCollection;
      newCollection.add(tail, 0);
      return newCollection;
    }

    // 如果是从尾部分段，则直接添加一个普通段落
    let newParagraph = this.getComponentFactory().buildParagraph();
    return newParagraph;
  }

  split(index: number, block?: Block | Block[]): OperatorType {
    let parent = this.getParent();
    let blockIndex = parent.findChildrenIndex(this);
    let splitBlock = this.splitChild(index);

    let addBlock: Block[] = [];

    if (!block || splitBlock.getSize() !== 0) {
      addBlock.push(splitBlock);
      parent.add(splitBlock, blockIndex + 1);
    }

    if (block) {
      if (!Array.isArray(block)) {
        block = [block];
      }

      addBlock.push(...block);
      parent.add(block, blockIndex + 1);
    }

    return [addBlock, { id: this.id, offset: index }];
  }

  addText(text: string, index?: number): OperatorType {
    index = index ? index : this.getSize();
    let charList: Character[] = [];

    for (let char of text) {
      charList.push(new Character(char));
    }

    this.addChildren(charList, index);
    return [[this], { id: this.id, offset: index + charList.length }];
  }

  // 在组件上下添加空余的行
  addEmptyParagraph(bottom: boolean): OperatorType {
    let parent = this.getParent();

    if (parent.type === ComponentType.article) {
      return super.addEmptyParagraph(bottom);
    }

    return parent.addEmptyParagraph(bottom);
  }

  sendTo(block: Block): OperatorType {
    return block.receive(this);
  }

  receive(block?: Block): OperatorType {
    let size = this.getSize();

    // ContentCollection 组件仅能接收 ContentCollection 组件
    if (!block || !(block instanceof ContentCollection)) {
      return [[]];
    }

    // 确保接收的组件已移除
    block.removeSelf();

    this.children = this.children.push(...block.children);
    updateComponent(this.editor, this);

    return [[this], { id: this.id, offset: size }];
  }

  // 将内容进行拆分，适应 HTML 的表现形式
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
      // 无 type 说明是字符串
      // @ts-ignore
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
