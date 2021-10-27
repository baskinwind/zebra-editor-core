import Editor from "../editor";
import Decorate, { AnyObject } from "../decorate";
import { OperatorType, JSONType } from "./component";
import Block from "./block";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import ComponentType from "../const/component-type";
import AbstractView from "../view/base-view";
import StructureType from "../const/structure-type";
import { createError } from "../util";
import ComponentFactory from "../factory";

abstract class ContentCollection extends Collection<Inline> {
  structureType = StructureType.content;

  static createChildren(componentFactory: ComponentFactory, json: JSONType): Inline[] {
    if (!json.children) {
      return [];
    }

    let children: Inline[] = [];
    json.children.forEach((each: JSONType) => {
      if (componentFactory.typeMap[each.type]) {
        children.push(componentFactory.typeMap[each.type].create(each));
        return;
      }

      if (!each.content) return;
      for (let char of each.content) {
        const chart = new Character(char);
        chart.modifyDecorate(each.style, each.data);
        children.push();
      }
    });

    return children;
  }

  constructor(text: string = "", editor?: Editor) {
    super(editor);
    if (text) {
      this.addText(text, 0);
    }
  }

  modifyContentDecorate(
    start: number = 0,
    end: number = -1,
    style?: AnyObject,
    data?: AnyObject,
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
          const chart = new Character(char);
          chart.modifyDecorate(decorate?.copyStyle(), decorate?.copyData());
          needAddInline.push(chart);
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

    // first of pharagraph
    if (start === -1 && end === 0) {
      return parent.childHeadDelete(this);
    }

    if (start < 0) {
      throw createError(`error position start: ${start} end: ${end}.`, this);
    }

    this.componentWillChange();
    this.removeChildren(start, end);
    this.updateComponent([this]);
    return [{ id: this.id, offset: start }];
  }

  splitChild(index: number): ContentCollection {
    let isTail = index === this.getSize();

    if (isTail) {
      return this.getComponentFactory().buildParagraph();
    }

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
      if (this.getSize() === 0) {
        this.removeSelf();
        blockIndex -= 1;
      }
    }

    if (blockList.length === 0 || splitBlock.getSize() !== 0) {
      needAddBlockList.push(splitBlock);
    }

    parent.add(blockIndex + 1, ...needAddBlockList);
    this.updateComponent([this]);
    return [{ id: needAddBlockList[0].id, offset: 0 }];
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

    if (!(block instanceof ContentCollection)) {
      return;
    }

    this.componentWillChange();
    block.removeSelf();

    this.children = this.children.push(...block.children);
    this.updateComponent([this]);

    return [{ id: this.id, offset: size }];
  }

  formatChildren() {
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

  getJSON(): JSONType {
    let raw: JSONType = {
      type: this.type,
      children: [],
    };

    this.formatChildren().forEach((each) => {
      if (each.type === ComponentType.character) {
        let charRaw = each.inlines[0].getJSON();
        charRaw.content = each.inlines.map((each) => each.content).join("");
        raw.children!.push(charRaw);
      } else {
        raw.children!.push(...each.inlines.map((each) => each.getJSON()));
      }
    });

    return raw;
  }

  getChildren(contentView: AbstractView) {
    let childrenRenderList: any[] = [];

    this.formatChildren().forEach((each, index) => {
      if (each.type === ComponentType.character) {
        childrenRenderList.push(
          contentView.buildCharacterList(
            `${this.id}__${index}`,
            each.inlines.map((each) => each.render(contentView)).join(""),
            each.decorate.getStyle(),
            each.decorate.getData(),
          ),
        );
      } else {
        childrenRenderList.push(...each.inlines.map((each) => each.render(contentView)));
      }
    });

    return childrenRenderList;
  }
}

export default ContentCollection;
