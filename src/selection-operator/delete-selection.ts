import Article from "../components/article";
import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import ContentCollection from "../components/content-collection";
import Table from "../components/table";
import { getComponentById } from "../components/util";
import { delayUpdate } from "./update-component";
import Code from "../components/code";
import input from "./input";

const deleteSelection = (
  event?: KeyboardEvent,
  isComposing: boolean = false
) => {
  let selection = getSelection();
  let isEnter = event?.key === "Enter";
  let isBackspace = event?.key === "Backspace";

  // 选中 article 直接子节点时，选中 table 前后时，会有该情况发生
  let article = getComponentById<Article>("article");
  if (selection.selectStructure) {
    event?.preventDefault();
    if (isEnter) {
      return focusAt(article.add(new Paragraph(), selection.range[0].offset));
    }
    if (isBackspace) {
      let component = getComponentById(selection.range[0].id);
      if (component instanceof Table) {
        return focusAt(component.replaceSelf(new Paragraph()));
      }
    }
    return;
  }

  // 选区为光标，且输入不为 Enter 或 Backspace 直接返回
  if (selection.isCollapsed && !(isEnter || isBackspace)) return;
  // 删除光标前一个位置
  if (selection.isCollapsed && isBackspace) {
    let component = getComponentById(selection.range[0].id);
    let start = selection.range[0].offset;
    // 优化段落内删除逻辑，不需要整段更新
    if (component instanceof ContentCollection) {
      if (start <= 1) {
        // 当删除发生在首位（或第一位）时，需要强制更新
        event?.preventDefault();
        return focusAt(component.remove(start - 1, start - 1, start > 1));
      } else {
        return component.remove(start - 1, start - 1, start > 1);
      }
    }
    // 非文字的删除需要强制更新
    event?.preventDefault();
    return focusAt(component.remove(start, start + 1));
  }

  // Enter 输入，需要手动控制，不然组件对应 dom 的关系不会更新
  if (selection.isCollapsed && isEnter) {
    event?.preventDefault();
    let component = getComponentById(selection.range[0].id);
    if (component instanceof Code) {
      return input('\n');
    }
    return focusAt(component.split(selection.range[0].offset));
  }

  let start = selection.range[0];
  let end = selection.range[1];
  // 获取所有选中的叶节点，不包括结构性的组件
  let idList = article.getIdList(start.id, end.id)[2];
  if (idList.length === 0) return;

  // 有选区时，阻止默认行为
  // 注：大坑，混合输入时 preventDefault 不起作用，采用延迟更新策略。
  event?.preventDefault();
  // 混合输入时，延迟更新
  if (isComposing) {
    delayUpdate(idList);
  }
  // 仅选中一行
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    let focus = component.remove(start.offset, end.offset - 1, isComposing);
    // 为 Enter 的处理
    if (isEnter) {
      focus = component.split(start.offset);
    }
    if (!isComposing) {
      return focusAt(focus);
    }
    return;
  }

  // 选中多行
  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  firstComponent.remove(start.offset, -1, isComposing);
  lastComponent.remove(0, end.offset - 1, isComposing);

  // Enter 时，删除中间行即可，首尾行不需要特殊处理
  if (isEnter) {
    for (let i = 1; i < idList.length - 1; i++) {
      getComponentById(idList[i]).removeSelf();
    }
    return focusAt({
      id: lastComponent.id,
      offset: 0
    });
  }

  // 其他情况，删除中间行，首尾行合并
  lastComponent.send(firstComponent, isComposing);
  for (let i = 1; i < idList.length - 1; i++) {
    getComponentById(idList[i]).removeSelf(isComposing);
  }
  if (!isComposing) {
    return focusAt({
      id: firstComponent.id,
      offset: start.offset
    });
  }
};

export default deleteSelection;
