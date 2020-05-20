import { List } from "immutable";
import { Operator } from "./component";
import Collection from "./collection";
import Inline from "./inline";
import Character from "./character";
import ComponentType from "../const/component-type";
import CharacterDecorate from "../decorate/character";
import { getBuilder } from "../builder";
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
    this.addChildren(componentList, index, tiggerBy);
  }

  addChildren(
    component: Inline | Inline[],
    index?: number,
    tiggerBy: string = "customer",
    list?: CharacterDecorate[]
  ) {
    let addInfo = super.addChildren(component, index, tiggerBy);
    if (!list) {
      list = addInfo.target.map(() => new CharacterDecorate());
    }
    if (typeof index === "number") {
      this.decorateList = this.decorateList.splice(index, 0, ...list);
    } else {
      this.decorateList = this.decorateList.push(...list);
    }
    this.update(addInfo);
    return addInfo;
  }

  removeChildren(
    componentOrIndex: Inline | number,
    removeNumber: number = 1,
    tiggerBy: string = "customer"
  ) {
    let removeInfo = super.removeChildren(
      componentOrIndex,
      removeNumber,
      tiggerBy
    );
    let size = removeInfo.target.length;
    let removeDecorate;
    if (removeInfo.index >= 0) {
      removeDecorate = this.decorateList
        .slice(removeInfo.index, this.decorateList.size)
        .toArray();
      this.decorateList = this.decorateList.splice(removeInfo.index, size);
    }
    removeInfo.removedDecorate = removeDecorate;
    this.update(removeInfo);
    return removeInfo;
  }

  subParagraph(
    start: number,
    end: number,
    tiggerBy: string = "customer"
  ): Operator {
    if (start !== end) {
      // 移除 start - end 的内容
      this.removeChildren(start, end - start, "inner");
    }
    // 移除原段落拆分处之后的内容，Inline 集合与 Decorate 集合。
    let removeInfo = this.removeChildren(start, -1, "inner");
    // 将移除的内容添加到新段落内。
    let newParagraph = new Paragraph();
    newParagraph.addChildren(
      removeInfo.target,
      0,
      "inner",
      removeInfo.removedDecorate
    );
    // 将新段落放在原段落之后。
    if (this.parent) {
      let index = this.parent.children.findIndex(
        (child) => child.id === this.id
      );
      newParagraph.addIntoParent(this.parent, index + 1, "inner");
    }
    let event = {
      type: `SUBPARAGRAPH:${this.type}`,
      target: [newParagraph],
      action: this,
      index: start,
      tiggerBy,
    };
    this.update(event);
    return event;
  }

  changeCharDecorate(
    type: string,
    value: string,
    start: number,
    end: number,
    tiggerBy = "customer"
  ) {
    for (let i = start; i <= end; i++) {
      let decorate = this.decorateList.get(i);
      decorate?.setStyle(type, value);
    }
    let event = {
      type: `CHANGECHARDECORATE:${this.type}`,
      target: this.children.slice(start, end).toArray(),
      action: this,
      index: start,
      tiggerBy,
    };
    this.update(event);
    return event;
  }

  render() {
    const builder = getBuilder();
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
        let decorate = this.decorateList.get(index) as CharacterDecorate;
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
