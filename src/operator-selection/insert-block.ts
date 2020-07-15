import Component from "../components/component";
import getSelection from "./get-selection";
import deleteSelection from "../operator-character/delete-selection";
import focusAt from "../operator-character/focus-at";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";

// 在光标处插入一个内容块
const insertBlock = (component: Component | Component[]) => {
  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  try {
    let nowComponent = getBlockById(selection.range[0].id);
    let start = selection.range[0].offset;
    focusAt(nowComponent.split(start, component));
    return;
  } catch (e) {
    console.warn(e);
  }
};

export default insertBlock;
