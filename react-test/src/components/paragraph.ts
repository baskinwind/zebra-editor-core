import ComponentType from "../const/component-type";

import { List } from "immutable";
import Collection, { Operator } from "./collection";
import Inline from "./inline";
import Character from "./character";
import CharacterDecorate from "../decorate/character";
import { getBuilder } from "../builder";

export default class Paragraph extends Collection<Inline> {
  type = ComponentType.paragraph;
  characterDecorateList: List<CharacterDecorate> = List();

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
