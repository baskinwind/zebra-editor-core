import Editor from "../editor/editor";
import { StoreData } from "../decorate";
import getSelection from "./get-selection";
import { getSelectedIdList } from "./util";
import focusAt from "./focus-at";

// 修改选区内的文字
const modifySelectionDecorate = (
  editor: Editor,
  style?: StoreData,
  data?: StoreData,
) => {
  let selection = getSelection(editor.mountedWindow);
  // 为光标时，不需要处理
  if (selection.isCollapsed) {
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];

  let idList = getSelectedIdList(start.id, end.id);
  // 未选中内容，不需要处理
  if (idList.length === 0) return;
  // 选中一行
  if (idList.length === 1) {
    let component = editor.storeManage.getBlockById(idList[0]);
    component.modifyContentDecorate(start.offset, end.offset - 1, style, data);
    return focusAt(editor.mountedWindow, start, end);
  }
  // 其他情况
  let firstComponent = editor.storeManage.getBlockById(idList[0]);
  let lastComponent = editor.storeManage.getBlockById(
    idList[idList.length - 1],
  );
  firstComponent.modifyContentDecorate(start.offset, -1, style, data);
  lastComponent.modifyContentDecorate(0, end.offset - 1, style, data);
  for (let i = 1; i < idList.length - 1; i++) {
    let component = editor.storeManage.getBlockById(idList[i]);
    component.modifyContentDecorate(0, -1, style, data);
  }
  focusAt(editor.mountedWindow, start, end);
};

export default modifySelectionDecorate;