import Editor from "../editor/editor";
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
    const article = editor.article;
    const focusBlock = editor.storeManage.getBlockById(selection.range[0].id);

    // 在文章首位按下删除，不需要操作
    if (
      selection.range[0].offset === 0 &&
      selection.isCollapsed &&
      article.findChildrenIndex(selection.range[0].id) === 0 &&
      focusBlock.type === ComponentType.paragraph
    ) {
      event.preventDefault();
      return;
    }

    backspace(editor, selection.range[0], selection.range[1], event);
    return;
  }
};

export default onKeyDown;
