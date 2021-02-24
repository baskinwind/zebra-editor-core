import Editor from "../editor/editor";
import Block from "../components/block";
import getSelection from "./get-selection";
import deleteSelection from "../operator/delete-selection";
import focusAt from "./focus-at";
import StructureType from "../const/structure-type";

// 在光标处插入一个内容块
const insertBlock = (editor: Editor, block: Block | Block[]) => {
  let selection = getSelection(editor.mountedWindow);
  if (!selection.isCollapsed) {
    deleteSelection(editor, selection.range[0], selection.range[1]);
    selection = getSelection(editor.mountedWindow);
  }

  try {
    let nowComponent = editor.storeManage.getBlockById(selection.range[0].id);
    let start = selection.range[0].offset;
    let operator = nowComponent.split(start, block);
    if (focus[0][0].structureType === StructureType.structure) {
      return;
    }
    focusAt(editor.mountedWindow, operator[1], operator[2]);
  } catch (e) {
    console.warn(e);
  }
};

export default insertBlock;
