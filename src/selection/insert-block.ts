import Editor from "../editor";
import Block from "../components/block";
import getSelection from "./get-selection";
import deleteSelection from "../operator/delete-selection";
import focusAt from "./focus-at";

// 在光标处插入一个内容块
const insertBlock = (editor: Editor, ...blockList: Block[]) => {
  let selection = getSelection(editor.mountedWindow);
  if (!selection.isCollapsed) {
    deleteSelection(editor, selection.range[0], selection.range[1]);
    selection = getSelection(editor.mountedWindow);
  }

  try {
    let nowComponent = editor.storeManage.getBlockById(selection.range[0].id);
    let start = selection.range[0];
    let operator = nowComponent.split(start.offset, ...blockList);
    focusAt(editor.mountedWindow, operator?.[0] || start, operator?.[1]);
  } catch (e) {
    console.warn(e);
  }
};

export default insertBlock;
