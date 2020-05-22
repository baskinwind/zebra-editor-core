import Character from "../components/character";
import Collection from "../components/collection";
import Paragraph from "../components/paragraph";
import CharacterDecorate from "../decorate/character";
import ComponentType from "../const/component-type";
import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import focusAt from "./focus-at";
import deleteSelection from "./delete-selection";
import input from "./input";

const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) return;
  event.preventDefault();
  deleteSelection(event);
  let key = event.key;
  // 字符输入
  if (key.length === 1) {
    input(event.key, event);
    return;
  }
};

export default onKeyDown;

const inImage = (event: KeyboardEvent, component: Collection<any>) => {
  let key = event.key;
  if (key === "Backspace") {
    component.removeSelf();
    let dom = document.getElementById(component.id);
    dom?.remove();
    return;
  }
};
