import Inline from "../components/inline";
import getSelection from "./get-selection";
import deleteSelection from "../operator/delete-selection";
import input from "../operator/input";
import { createRecord } from "../record/util";

// 在光标处插入一个内容块
const insertInline = (component: string | Inline) => {
  let selection = getSelection();
  createRecord(selection.range[0], selection.range[1]);
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  input(component, selection.range[0]);
};

export default insertInline;
