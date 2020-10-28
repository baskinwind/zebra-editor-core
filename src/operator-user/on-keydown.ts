import Article from "../components/article";
import ComponentType from "../const/component-type";
import getSelection from "../operator-selection/get-selection";
import enter from "../operator/enter";
import backspace from "../operator/backspace";
import { createRecord } from "../record/util";
import { getBlockById } from "../components/util";

// keydown 主要处理一些特殊表现的按键
// enter backspace
const onKeyDown = (event: KeyboardEvent) => {
  let key = event.key.toLowerCase();
  let isEnter = key === "enter";
  let isBackspace = key === "backspace";
  if (!(isEnter || isBackspace)) {
    return;
  }

  let selection = getSelection();

  // 换行
  if (isEnter) {
    createRecord(selection.range[0], selection.range[1]);
    enter(selection.range[0], selection.range[1], event);
    return;
  }

  // 删除
  if (isBackspace) {
    const article = getBlockById<Article>("article");
    const focusBlock = getBlockById(selection.range[0].id);

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

    createRecord(selection.range[0], selection.range[1]);
    backspace(selection.range[0], selection.range[1], event);
    return;
  }
};

export default onKeyDown;
