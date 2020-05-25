import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";
import Character from "../components/character";
import updateComponent from "./update-component";
import focusAt from "./focus-at";
import Inline from "../components/inline";
import deleteSelection from "./delete-selection";

const input = (charOrInline: string | Inline, event?: Event) => {
  deleteSelection();
  let selection = getSelection();
  let component = getComponentById(selection.range[0].id);
  let offset = selection.range[0].offset;
  if (component instanceof Paragraph) {
    if (typeof charOrInline !== "string") {
      component.addChildren(charOrInline, offset);
      updateComponent(component);
      focusAt({
        id: component.id,
        offset: offset + 1,
      });
      return;
    }
    let char = charOrInline;
    // 空格视为逃跑字符，即不会使用该字符前的样式，但如果空格在样式内，则不逃跑
    let escape =
      char === " " &&
      (offset === 0 ||
        offset === component.children.size ||
        !component.children
          .get(offset - 1)
          ?.decorate?.isSame(component.children.get(offset + 1)?.decorate));
    if (escape) {
      component.addChildren(new Character(char), offset);
      if (event) {
        event.preventDefault();
        updateComponent(component);
        focusAt({
          id: component.id,
          offset: offset + 1,
        });
      }
      return;
    }
    // 字符默认使用之前字符的样式，如果第一个字符前输入字符，则使用第一个字符的样式
    let index;
    if (offset === 0) {
      index = 0;
    } else {
      index = offset - 1;
    }
    let decorate = component.children.get(index)?.decorate;

    component.addChildren(
      new Character(char, decorate?.getStyle(), decorate?.getData()),
      offset
    );
    updateComponent(component);
    focusAt({
      id: component.id,
      offset: offset + 1,
    });
  }
};

export default input;
