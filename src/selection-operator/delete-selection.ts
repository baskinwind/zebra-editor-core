import Article from "../components/article";
import Paragraph from "../components/paragraph";
import Media from "../components/media";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import updateComponent from "./update-component";
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
    // 段落的处理
    if (component instanceof Paragraph) {
      let startPosition = getCursorPosition(selection.range[0]);
      if (!startPosition) return;
      // 优化段落内删除，不需要整段更新
      if (selection.range[0].offset !== 0) {
        if (startPosition.node.nodeValue?.length) {
          startPosition.node.nodeValue = startPosition.node.nodeValue.slice(
            0,
            -1
          );
        }
        if (startPosition.node instanceof HTMLImageElement) {
          startPosition.node.parentElement?.remove();
        }
      }
      let focus = component.removeChildren(
        selection.range[0].offset - 1,
        1,
        selection.range[0].offset !== 0
      );
      if (!focus) return;
      focusAt({
        id: focus[0].id,
        offset: focus[1],
      });
      return;
    }
    // 多媒体直接删除
    if (component instanceof Media) {
      let focus = component.removeSelf();
      if (!focus) return;
      focusAt({
        id: focus[0].id,
        offset: focus[1],
      });
      return;
    }
  }
  if (selection.isCollapsed && isEnter) {
    let component = getComponentById(selection.range[0].id);
    let focus = component.split(selection.range[0].offset);
    if (!focus) return;
    focusAt({
      id: focus[0].id,
      offset: focus[1],
    });
    return;
  }
  let start = selection.range[0];
  let end = selection.range[1];
  let article = getComponentById<Article>("article");
  // 根据开始和结束的 id 获取所有选中的组件
  let idList = article.getIdList(start.id, end.id)[2];
  if (idList.length === 0) return;
  // 仅选中一行
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    let focus = component.remove(start.offset, end.offset);
    // 为 Enter 的处理
    if (isEnter) {
      focus = component.split(start.offset) || focus;
    }
    if (!focus) return;
    focusAt({
      id: focus[0].id,
      offset: focus[1],
    });
    return;
  }

  // 选中多行
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  if (!firstComponent.parent || !lastComponent.parent) return;
  let firstIndex = firstComponent.parent.findChildrenIndex(firstComponent);
  // 首行是段落，删除选中内容
  if (firstComponent instanceof Paragraph) {
    firstComponent.removeChildren(
      start.offset,
      firstComponent.children.size - 1
    );
  }
  // 首行是多媒体，直接删除
  if (firstComponent instanceof Media) {
    firstComponent.removeSelf();
  }
  // 尾行是段落，删除选中内容
  if (lastComponent instanceof Paragraph) {
    lastComponent.removeChildren(0, end.offset);
  }
  // 尾行是多媒体，直接删除
  if (lastComponent instanceof Media) {
    lastComponent.removeSelf();
  }
  // 若为 Enter 则删除中间行即可
  if (isEnter) {
    for (let i = 1; i < idList.length - 2; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    updateComponent(idList.map((id) => getComponentById(id)));
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
    return;
  }

  // 其他情况
  // 首行和尾行都为段落，则需要合并
  if (
    firstComponent instanceof Paragraph &&
    lastComponent instanceof Paragraph
  ) {
    let lastContent = lastComponent.children.slice(0).toArray();
    firstComponent.addChildren(lastContent, undefined);
    for (let i = 1; i < idList.length - 1; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    updateComponent(idList.map((id) => getComponentById(id)));
    focusAt({
      id: firstComponent.id,
      offset: start.offset,
    });
    return;
  }

  // 不都是段落的情况，保留一行
  // 都不是段落，则新生成一行
  for (let i = 1; i < idList.length - 2; i++) {
    getComponentById(idList[i]).removeSelf();
  }
  let updateList = idList.map((id) => getComponentById(id));
  if (!firstComponent.actived && !lastComponent.actived) {
    let newParagraph = new Paragraph();
    updateList.push(newParagraph);
    article.addChildren(newParagraph, firstIndex);
  }
  updateComponent(updateList);
  // 调整光标的位置
  if (firstComponent.actived) {
    focusAt({
      id: firstComponent.id,
      offset: start.offset,
    });
  } else if (lastComponent.actived) {
    focusAt({
      id: lastComponent.id,
      offset: 0,
    });
  } else {
    focusAt({
      id: updateList[updateList.length - 1].id,
      offset: 0,
    });
  }
  return;
};

export default deleteSelection;
