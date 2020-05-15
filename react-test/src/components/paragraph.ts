import ComponentType from "../const/component-type";
import { storeData } from "../decorate/base";

import { List } from "immutable";

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

  addText(text: string, index?: number) {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    this.addChildren(componentList, index);
  }

  addChildren(component: Inline | Inline[], index?: number): Operator {
    let addInfo = super.addChildren(component, index);
    let list = addInfo.target.map(() => new CharacterDecorate());
    if (typeof index === "number") {
      this.characterDecorateList = this.characterDecorateList.splice(
        index,
        0,
        ...list
      );
    } else {
      this.characterDecorateList = this.characterDecorateList.push(...list);
    }
    return addInfo;
  }

  removeChildren(
    componentOrIndex: Inline | number,
    removeNumber: number = 1
  ): Operator {
    let removeInfo = super.removeChildren(componentOrIndex, removeNumber);
    let size = removeInfo.target.length;
    if (removeInfo.index >= 0) {
      this.characterDecorateList = this.characterDecorateList.splice(
        removeInfo.index,
        size
      );
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

  changeCharStyle(type: string, value: string, start: number, end: number) {
    for (let i = start; i <= end; i++) {
      let decorate = this.characterDecorateList.get(i);
      decorate?.setStyle(type, value);
    }
  }

  getContent() {
    const builder = getBuilder();
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: CharacterDecorate;
    let createCharacterList = () => {
      if (!acc.length) return;
      content.push(
        builder.buildCharacterList(
          `${this.id}__${content.length}`,
          acc.map((character) => character.getContent()),
          prevDecorate.getStyle()
        )
      );
      acc = [];
    };

    this.children.forEach((value, index) => {
      if (value instanceof Character) {
        let decorate = this.characterDecorateList.get(
          index
        ) as CharacterDecorate;
        console.log(decorate?.isSame(prevDecorate));

        if (!decorate?.isSame(prevDecorate)) {
          createCharacterList();
          prevDecorate = decorate;
        }
        acc.push(value);
        return;
      }
      createCharacterList();
      content.push(value.getContent());
    });
    createCharacterList();

    return builder.buildParagraph(
      this.id,
      content,
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
