import Component from "../components/component";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import Inline from "../components/inline";
import input from "../util/input";

// 在光标处插入一个内容块
const insertInline = (component: string | Inline) => {
  let selection = getSelection();
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  input(component, selection.range[0]);
};

export default insertInline;
