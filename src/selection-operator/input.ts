import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import Paragraph from "../components/paragraph";
import Character from "../components/character";
import updateComponent from "./update-component";
import focusAt from "./focus-at";

const input = (char: string, event?: Event) => {
  let selection = getSelection();
  let component = getComponentById(selection.range[0].id);
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
    let decorate;
    if (offset === 0) {
      decorate = component.decorateList.get(0)?.clone();
    } else {
      decorate = component.decorateList.get(offset - 1)?.clone();
    }
    component.addChildren(new Character(char), offset, decorate);
    updateComponent(component)
    focusAt({
      id: component.id,
      offset: offset + 1,
    })
  }
};

export default input;
