import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/pparagraph";
import Character from "../components/ccharacter";

const input = (char: string) => {
  let selection = getSelection();
  let component = getComponentById(selection.range[0].componentId);
  let offset = selection.range[0].offset;
  if (component instanceof Paragraph) {
    let escape =
      char === " " &&
      (offset === 0 ||
        offset === component.children.size ||
        !component.decorateList
          .get(offset - 1)
          ?.isSame(component.decorateList.get(offset + 1)));
    if (escape) {
      component.addChildren(new Character(char), offset);
      return;
    }
    let decorate;
    if (offset === 0) {
      decorate = component.decorateList.get(0)?.clone();
    } else {
      decorate = component.decorateList.get(offset - 1)?.clone();
    }
    component.addChildren(new Character(char), offset, decorate);
  }
};

export default input;
