import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";

export default class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  structureType = StructureType.content;

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

  changeCharDecorate(type: string, value: string, start: number, end: number) {
    for (let i = Math.min(start, end); i <= Math.max(end, start); i++) {
      let decorate = this.children.get(i)?.decorate;
      if (decorate !== undefined) {
        decorate?.setStyle(type, value);
      }
    }
  }

  mergaParagraph(paragraph: Paragraph) {
    paragraph.removeSelf();
    this.children = this.children.push(...paragraph.children);
  }

  getCharList() {
    const builder = getContentBuilder();
    let content: any[] = [];
    let acc: Character[] = [];
    let prevDecorate: Decorate;
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
      content.push(value.render());
    });
    createCharacterList();
    return content;
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getCharList(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
