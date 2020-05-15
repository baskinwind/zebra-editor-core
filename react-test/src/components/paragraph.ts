import ComponentType from "../const/component-type";

import { List } from "immutable";
import { storeData } from "../decorate/base";

import Collection, { Operator } from "./collection";
import Inline from "./inline";
import Character from "./character";
import CharacterDecorate from "../decorate/character";
import { getBuilder } from "../builder";

export default class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  characterDecorateList: List<CharacterDecorate> = List();

  constructor(text?: string, style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text);
    }
  }

  addText(text: string) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    this.addChildren(componentList);
  }

  addChildren(component: Inline | Inline[], index?: number): Operator {
    let addInfo = super.addChildren(component, index);
    addInfo.target.forEach((_, index) => {
      this.characterDecorateList.insert(
        addInfo.index + index,
        new CharacterDecorate()
      );
    });
    return addInfo;
  }

  removeChildren(
    componentOrIndex: Inline | number,
    removeNumber: number = 1
  ): Operator {
    let removeInfo = super.removeChildren(componentOrIndex, removeNumber);
    if (removeInfo.index >= 0) {
      this.characterDecorateList?.splice(removeInfo.index, 1);
    }
    return removeInfo;
  }

  subParagraph(index: number) {
    let moveInfo = this.removeChildren(index, -1);
    let newParagraph = new Paragraph();
    if (this.parent) {
      let index = this.parent.children.findIndex(
        (child) => child.id === this.id
      );
      newParagraph.addIntoParent(this.parent, index + 1);
    }
    moveInfo.target.forEach((comp) => {
      comp.addIntoParent(newParagraph);
    });
    return {
      type: "SUBPARAGRAPH",
      target: [newParagraph],
      action: this,
      index: index,
    };
  }

  getContent() {
    const builder = getBuilder();
    let content: any[] = [];
    let acc: Character[] = [];
    // TODO: 后期需要根据 characterDecorateList 动态生成内容
    this.children.forEach((value, index) => {
      if (value instanceof Character) {
        acc.push(value);
      }
      // 处理字符串列表
      if (
        (!(value instanceof Character) || index === this.children.size - 1) &&
        acc.length !== 0
      ) {
        content.push(
          builder.buildCharacterList(
            `${this.id}__${content.length}`,
            acc.map((character) => character.getContent()),
            {},
            {}
          )
        );
        acc = [];
      }
      if (!(value instanceof Character)) {
        content.push(value.getContent());
      }
    });
    return builder.buildParagraph(
      this.id,
      content,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
