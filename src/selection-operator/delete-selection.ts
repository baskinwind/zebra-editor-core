import Article from "../components/article";
import Paragraph from "../components/paragraph";
import getSelection from "./get-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition } from "./util";
import ContentCollection from "../components/content-collection";
import Table from "../components/table";
import updateComponent from "./update-component";

const deleteSelection = (event?: KeyboardEvent, dom?: any) => {
  let selection = getSelection();
  let isEnter = event?.key === "Enter";
  let isBackspace = event?.key === "Backspace";

  // 处理，选中 article 直接子节点时
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

  // 选取为光标，且输入不为 Enter 或 Backspace 直接返回
  if (selection.isCollapsed && !(isEnter || isBackspace)) return;
  // 删除光标前一个位置
  if (selection.isCollapsed && isBackspace) {
    let component = getComponentById(selection.range[0].id);
    let start = selection.range[0].offset;
    // 优化段落内删除逻辑，不需要整段更新
    if (component instanceof ContentCollection) {
      if (start <= 1) {
        event?.preventDefault();
        return focusAt(component.remove(start - 1, start - 1, start > 1));
      } else {
        return component.remove(start - 1, start - 1, start > 1);
      }
    }
    event?.preventDefault();
    return focusAt(component.remove(start, start + 1));
  }

  if (selection.isCollapsed && isEnter) {
    event?.preventDefault();
    let component = getComponentById(selection.range[0].id);
    return focusAt(component.split(selection.range[0].offset));
  }

  let start = selection.range[0];
  let end = selection.range[1];
  // 根据开始和结束的 id 获取所有选中的组件 id
  let idList = article.getIdList(start.id, end.id)[2];
  if (idList.length === 0) return;

  // 仅选中一行
  if (idList.length === 1) {
    let id = idList[0];
    let component = getComponentById(id);
    component.remove(start.offset, end.offset - 1, true);
    // 为 Enter 的处理
    if (isEnter) {
      event?.preventDefault();
      updateComponent(component);
      return focusAt(component.split(start.offset));
    }
    return;
  }

  // 选中多行
  event?.preventDefault();
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
      offset: 0
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
    offset: start.offset
  });

  let e1 = event as KeyboardEvent;

  let e2 = document.createEvent('KeyboardEvent');
  e2.initEvent('keydown', true, true);
  // @ts-ignore
  e2.key = e1.key;
  // let e2 = new KeyboardEvent('keydown', {
  //   key: 'z'
  // });
  document.getElementById(firstComponent.id)?.dispatchEvent(e2);

  return;
};

export default deleteSelection;
