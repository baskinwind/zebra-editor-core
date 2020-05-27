import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import Decorate from "../decorate";
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getContentBuilder } from "../builder";
import { storeData } from "../decorate/index";
import Media from "./media";
import updateComponent from "../selection-operator/update-component";
import Component, { operatorType } from "./component";

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
    updateComponent(this);
  }

  mergaParagraph(paragraph: Paragraph) {
    paragraph.removeSelf();
    this.children = this.children.push(...paragraph.children);
    updateComponent(this);
  }

  removeChildren(indexOrComponent: Inline | number, removeNumber: number = 1): operatorType {
    if (indexOrComponent < 0 && removeNumber === 1) {
      let parent = this.parent;
      if (!parent) return;
      let prev = parent.getPrev(this);
      if (prev) {
        if (prev instanceof Media) {
          prev.removeSelf();
          return [this, 0, 0];
        }
        if (prev instanceof Paragraph) {
          let index = prev.children.size;
          prev.mergaParagraph(this);
          return [prev, index, index];
        }
        return;
      }
      let grandParent = parent?.parent;
      if (!grandParent) return;
      let parentIndex = grandParent.findChildrenIndex(parent);
      this.removeSelf();
      this.decorate.removeData('tag');
      this.addIntoParent(grandParent, parentIndex);
      return [this, 0, 0];
    }
    return super.removeChildren(indexOrComponent, removeNumber);
  }

  getContent() {
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
      content.push(value.render());
    });
    createCharacterList();
    return content;
  }

  render() {
    const builder = getContentBuilder();
    return builder.buildParagraph(
      this.id,
      this.getContent(),
      this.decorate.getStyle(),
      this.decorate.getData()
    );
  }
}
