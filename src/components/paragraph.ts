import { List } from "immutable";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import ComponentType from "../const/component-type";
import CharacterDecorate from "../decorate/character";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/base";

export default class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  decorateList: List<CharacterDecorate> = List();

  constructor(text?: string, style?: storeData, data?: storeData) {
    super(style, data);
    if (text) {
      this.addText(text);
    }
  }

  addText(text: string, index?: number, tiggerBy: string = "customer") {
    let componentList: Character[] = [];
    for (let char of text) {
      componentList.push(new Character(char));
    }
    this.addChildren(componentList, index);
  }

  addChildren(
    component: Inline | Inline[],
    index?: number,
    list?: CharacterDecorate | CharacterDecorate[]
  ) {
    let addInfo = super.addChildren(component, index);
    if (!list) {
      list = addInfo.target.map(() => new CharacterDecorate());
    }
    if (!Array.isArray(list)) {
      list = [list];
    }
    if (typeof index === "number") {
      this.decorateList = this.decorateList.splice(index, 0, ...list);
    } else {
      this.decorateList = this.decorateList.push(...list);
    }
    return addInfo;
  }

  removeChildren(componentOrIndex: Inline | number, removeNumber: number = 1) {
    let removeInfo = super.removeChildren(componentOrIndex, removeNumber);
    let size = removeInfo.target.length;
    let removeDecorate;
    if (removeInfo.start >= 0) {
      removeDecorate = this.decorateList
        .slice(removeInfo.start, removeInfo.end)
        .toArray();
      this.decorateList = this.decorateList.splice(removeInfo.start, size);
    }
    removeInfo.removedDecorate = removeDecorate;
    return removeInfo;
  }

  changeCharDecorate(type: string, value: string, start: number, end: number) {
    for (let i = Math.min(start, end); i <= Math.max(end, start); i++) {
      let decorate = this.decorateList.get(i);
      if (decorate !== undefined) {
        decorate?.setStyle(type, value);
      }
    }
    return {
      type: `CHANGECHARDECORATE:${this.type}`,
      target: this.children.slice(start, end).toArray(),
      action: this,
      start,
      end,
    };
  }

  render() {
    const builder = getContentBuilder();
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: CharacterDecorate;
    let createCharacterList = () => {
      if (!acc.length) return;
      content.push(
        builder.buildCharacterList(
          `${this.id}__${content.length}`,
          acc.map((character) => character.render()),
          prevDecorate.getStyle()
        )
      );
      acc = [];
    };

    this.children.forEach((value, index) => {
      if (value instanceof Character) {
        let decorate = this.decorateList.get(index);
        if (!decorate) return;
        if (!decorate?.isSame(prevDecorate)) {
          createCharacterList();
          prevDecorate = decorate;
        }
        acc.push(value);
        return;
      }
      createCharacterList();
      content.push(value.render());
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
