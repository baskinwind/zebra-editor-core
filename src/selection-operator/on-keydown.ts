import Character from "../components/ccharacter";
import Collection from "../components/collection";
import Paragraph from "../components/pparagraph";
import CharacterDecorate from "../decorate/character";
import ComponentType from "../const/component-type";
import getSelection from "./get-selection";
import { getComponentById } from "../components/util";
import focusAt from "./focus-at";
import deleteSelection from "./delete-selection";
import input from "./input";

const onKeyDown = (event: KeyboardEvent) => {
  let selection = getSelection();
  let start = selection.range[0].offset;
  let end = selection.range[1].offset;
  if (start > end) {
    [start, end] = [end, start];
  }
  if (event.ctrlKey || event.metaKey) return;
  let key = event.key;
  if (key === "Backspace") {
    // 删除选中内容
    deleteSelection();
  }
  // 字符输入
  if (key.length === 1) {
    // 删除选中内容
    deleteSelection();
    input(event.key);
    return;
  }
  // 触发换行
  if (key === "Enter") {
    // 删除选中内容
    deleteSelection(true);
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
