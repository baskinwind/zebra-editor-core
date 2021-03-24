import Decorate, { StoreData } from "../decorate";
import { OperatorType, IRawType } from "./component";
import Block from "./block";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import ComponentFactory from ".";
import ComponentType from "../const/component-type";
import BaseBuilder from "../builder/base-builder";
import StructureType from "../const/structure-type";
import { createError } from "../util/handle-error";

abstract class ContentCollection extends Collection<Inline> {
  structureType = StructureType.content;

  static createChildren(componentFactory: ComponentFactory, raw: IRawType): Inline[] {
    if (!raw.children) {
      return [];
    }

    let children: Inline[] = [];
    raw.children.forEach((each: IRawType) => {
      // 其他的 Inline 类型
      if (componentFactory.typeMap[each.type]) {
        children.push(componentFactory.typeMap[each.type].create(each));
        return;
      }

      // 字符的 Inline 类型
      if (!each.content) return;
      for (let char of each.content) {
        children.push(new Character(char, each.style, each.data));
      }
    });

    return children;
  }

  constructor(text: string = "", style?: StoreData, data?: StoreData) {
    super(style, data);
    if (text) {
      this.addText(text, 0);
    }
  }

  modifyContentDecorate(
    start: number = 0,
    end: number = -1,
    style?: StoreData,
    data?: StoreData,
  ): OperatorType {
    end = end < 0 ? this.getSize() + end : end;

    if (start > end || (!style && !data)) {
      return [{ id: this.id, offset: start }];
    }

    this.componentWillChange();
    for (let i = start; i <= end; i++) {
      this.getChild(i)?.modifyDecorate(style, data);
    }
    this.updateComponent([this]);

    return [
      { id: this.id, offset: start },
      { id: this.id, offset: end },
    ];
  }

  add(index: number, ...inline: Inline[] | string[]): OperatorType {
    index = index < 0 ? this.getSize() + 1 + index : index;
    let needAddInline: Inline[] = [];

    inline.forEach((each: string | Inline) => {
      if (typeof each === "string") {
        let decorate = this.children.get(index === 0 ? 0 : index - 1)?.decorate;
        for (let char of each) {
          needAddInline.push(new Character(char, decorate?.copyStyle(), decorate?.copyData()));
        }
      } else {
        needAddInline.push(each);
      }
    });

    this.componentWillChange();
    this.addChildren(index, needAddInline);
    this.updateComponent([this]);
    return [{ id: this.id, offset: index + inline.length }];
  }

  remove(start: number, end: number = start + 1): OperatorType {
    let parent = this.getParent();

    // 在段落的首处按下删除时
    if (start === -1 && end === 0) {
      return parent.childHeadDelete(this);
    }

    if (start < 0) {
      throw createError(`start：${start}、end：${end}不合法。`, this);
    }

    this.componentWillChange();
    this.removeChildren(start, end);
    this.updateComponent([this]);
    return [{ id: this.id, offset: start }];
  }

  splitChild(index: number): ContentCollection {
    let isTail = index === this.getSize();

    // 如果是从尾部分段，则直接添加一个普通段落
    if (isTail) {
      return this.getComponentFactory().buildParagraph();
    }

    // 如果是从中间分段，则保持段落类型
    let tail = this.children.toArray().slice(index);
    this.removeChildren(index);
    let newCollection = this.createEmpty() as ContentCollection;
    newCollection.add(0, ...tail);
    return newCollection;
  }

  split(index: number, ...blockList: Block[]): OperatorType {
    let parent = this.getParent();
    let blockIndex = parent.findChildrenIndex(this);

    this.componentWillChange();
    let splitBlock = this.splitChild(index);
    let needAddBlockList: Block[] = [];

    if (blockList.length) {
      needAddBlockList.push(...blockList);
      // 在首位切割时，若会放入内容，则将空行删除
      if (this.getSize() === 0) {
        this.removeSelf();
        blockIndex -= 1;
      }
    }

    // 注：切出的块有可能为空
    // 若没有添加的块，或切出的块有内容时，添加切出的块
    if (blockList.length === 0 || splitBlock.getSize() !== 0) {
      needAddBlockList.push(splitBlock);
    }

    parent.add(blockIndex + 1, ...needAddBlockList);
    this.updateComponent([this]);
    return [{ id: splitBlock.id, offset: 0 }];
  }

  addText(text: string, index?: number): OperatorType {
    index = index ? index : this.getSize();
    let charList: Character[] = [];

    for (let char of text) {
      charList.push(new Character(char));
    }

    this.addChildren(index, charList);
    return [{ id: this.id, offset: index + charList.length }];
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

  receive(block: Block): OperatorType {
    let size = this.getSize();

    // ContentCollection 组件仅能接收 ContentCollection 组件
    if (!(block instanceof ContentCollection)) {
      return [];
    }

    this.componentWillChange();
    // 移除接收到的组件
    block.removeSelf();

    this.children = this.children.push(...block.children);
    this.updateComponent([this]);

    return [{ id: this.id, offset: size }];
  }

  // 将内容进行拆分，适应 HTML 的表现形式
  fromatChildren() {
    let formated: {
      inlines: Inline[];
      type: string;
      decorate: Decorate;
    }[] = [];

    this.children.forEach((each) => {
      let lastFormated = formated[formated.length - 1];

      if (
        lastFormated === undefined ||
        lastFormated.type !== each.type ||
        !lastFormated.decorate.isSame(each.decorate)
      ) {
        formated.push({
          type: each.type,
          inlines: [each],
          decorate: each.decorate,
        });
        return;
      }

      lastFormated.inlines.push(each);
    });

    return formated;
  }

  getRaw(): IRawType {
    let raw: IRawType = {
      type: this.type,
      children: [],
    };

    this.fromatChildren().map((each) => {
      if (each.type === ComponentType.character) {
        let charRaw = each.inlines[0].getRaw();
        charRaw.content = each.inlines.map((each) => each.content).join("");
        raw.children!.push(charRaw);
      } else {
        raw.children!.push(...each.inlines.map((each) => each.getRaw()));
      }
    });

    return raw;
  }

  getChildren(contentBuilder: BaseBuilder) {
    let childrenRenderList: any[] = [];

    this.fromatChildren().map((each, index) => {
      if (each.type === ComponentType.character) {
        childrenRenderList.push(
          contentBuilder.buildCharacterList(
            `${this.id}__${index}`,
            each.inlines.map((each) => each.render(contentBuilder)).join(""),
            each.decorate.getStyle(),
            each.decorate.getData(),
          ),
        );
      } else {
        childrenRenderList.push(...each.inlines.map((each) => each.render(contentBuilder)));
      }
    });

    return childrenRenderList;
  }
}

export default ContentCollection;
