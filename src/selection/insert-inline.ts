import Inline from "../components/inline";
import getSelection from "./get-selection";
import deleteSelection from "../operator/delete-selection";
import input from "../operator/input";
import Editor from "../editor";

// 在光标处插入一个内容块
const insertInline = (editor: Editor, component: string | Inline) => {
  let selection = getSelection(editor);
  if (!selection.isCollapsed) {
    deleteSelection(editor, selection.range[0], selection.range[1]);
    selection = getSelection(editor);
  }
  input(editor, component, selection.range[0]);
};

export default insertInline;
