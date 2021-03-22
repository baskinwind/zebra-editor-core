import Editor from "../editor";
import ComponentType from "../const/component-type";
import getSelection from "../selection/get-selection";
import enter from "../operator/enter";
import backspace from "../operator/backspace";

const onKeyDown = (editor: Editor, event: KeyboardEvent) => {
  let key = event.key.toLowerCase();
  let isEnter = key === "enter";
  let isBackspace = key === "backspace";
  if (!(isEnter || isBackspace)) {
    return;
  }

  let selection = getSelection(editor.mountedWindow);

  // 换行
  if (isEnter) {
    enter(editor, selection.range[0], selection.range[1], event);
    return;
  }

  // 删除
  if (isBackspace) {
    backspace(editor, selection.range[0], selection.range[1], event);
    return;
  }
};

export default onKeyDown;
