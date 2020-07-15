import getSelection from "./get-selection";
import modifyInlineDecorate from "../operator-character/modify-inline-decorate";
import { storeData } from "../decorate";
import { createRecord } from "../record/util";

// 修改选内内的文字
const modifySelectionDecorate = (style?: storeData, data?: storeData) => {
  let selection = getSelection();
  // 为光标时，不需要处理
  if (selection.isCollapsed) {
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  createRecord(start, end);
  modifyInlineDecorate(start, end, style, data);
};

export default modifySelectionDecorate;
