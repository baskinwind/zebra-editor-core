import Article from "../components/article";
import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition } from "./util";

const deleteSelection = (key?: string) => {
  let selection = getSelection();
  let isEnter = key === "Enter";
  let isBackspace = key === "Backspace";
  // 选取为光标，且输入不为 Enter 或 Backspace 直接返回
  if (selection.isCollapsed && !(isEnter || isBackspace)) return;
  // 删除光标前一个位置
  if (selection.isCollapsed && isBackspace) {
    let component = getComponentById(selection.range[0].id);
    let start = selection.range[0].offset;
    // 优化段落内删除逻辑，不需要整段更新
    if (component instanceof Paragraph) {
      let startPosition = getCursorPosition(selection.range[0]);
      if (!startPosition) return;
      let node = startPosition.node;
      let index = startPosition.index;
      if (index > 0) {
        if (node.nodeValue?.length) {
          node.nodeValue = `${node.nodeValue.slice(
            0,
            index - 1
          )}${node.nodeValue.slice(index)}`;
        }
        if (node instanceof HTMLImageElement) {
          node.parentElement?.remove();
        }
      }
      let focus = component.remove(start - 1, start - 1, start > 0);
      focusAt(focus);
      return;
    }
    let focus = component.remove(start, start + 1);
    focusAt(focus);
    return;
  }
  if (selection.isCollapsed && isEnter) {
    let component = getComponentById(selection.range[0].id);
    let focus = component.split(selection.range[0].offset);
    focusAt(focus);
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");

  // 根据开始和结束的 id 获取所有选中的组件 id
  let idList = article.getIdList(start.id, end.id)[2];
  if (idList.length === 0) return;

  // 仅选中一行
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    let focus = component.remove(start.offset, end.offset - 1);
    // 为 Enter 的处理
    if (isEnter) {
      focus = component.split(start.offset) || focus;
    }
    focusAt(focus);
    return;
  }

  // 选中多行
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  if (!firstComponent.parent || !lastComponent.parent) return;
  firstComponent.remove(start.offset, -1);
  lastComponent.remove(0, end.offset - 1);

  // 若为 Enter 则删除中间行即可
  if (isEnter) {
    for (let i = 1; i < idList.length - 1; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
    return;
  }

  // 其他情况
  firstComponent.addIntoTail(lastComponent);
  for (let i = 1; i < idList.length - 1; i++) {
    getComponentById(idList[i]).removeSelf();
  }
  focusAt({
    id: firstComponent.id,
    offset: start.offset,
  });
  return;
};

export default deleteSelection;
