import getSelection from "./get-selection";
import modifyInlineDecorate from "../operator/modify-inline-decorate";
import { storeData } from "../decorate";
import Editor from "../editor/editor";

// 修改选区内的文字
const modifySelectionDecorate = (
  editor: Editor,
  style?: storeData,
  data?: storeData,
) => {
  let selection = getSelection(editor.mountedWindow);
  // 为光标时，不需要处理
  if (selection.isCollapsed) {
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  modifyInlineDecorate(editor, start, end, style, data);
};

export default modifySelectionDecorate;
