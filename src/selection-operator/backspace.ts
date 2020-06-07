import ContentCollection from "../components/content-collection";
import focusAt from "./focus-at";
import { cursorType, getSelectedIdList } from "./util";
import { getComponentById } from "../components/util";
import { delayUpdate } from "./update-component";
import StructureType from "../const/structure-type";

// 删除：删除 start - end 的内容，若开始与结束一致，则删除前一个字符
const backspace = (start: cursorType, end?: cursorType, event?: KeyboardEvent | CompositionEvent) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    let component = getComponentById(start.id);
    // 优化段落内删除逻辑，不需要整段更新
    if (component.structureType = StructureType.content) {
      if (start.offset <= 1) {
        // 当删除发生在首位（或第一位）时，需要强制更新
        event?.preventDefault();
        return focusAt(component.remove(start.offset - 1, start.offset));
      }
      return component.remove(start.offset - 1, start.offset, true);
    }
    // 非文字的删除需要强制更新
    event?.preventDefault();
    return focusAt(component.remove(start.offset, start.offset + 1));
  }

  // TODO: 验证所有浏览器的中文输入问题
  let isComposing = false;
  let idList = getSelectedIdList(start.id, end.id);

  // 选中多行，需要阻止默认行为
  event?.preventDefault();
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getComponentById(idList[0]);
    let focus = component.remove(start.offset, end.offset, isComposing);
    if (!isComposing) {
      return focusAt(focus);
    }
    return;
  }

  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  // 为了避免 send 时，组件不更新，此处需要开启更新
  firstComponent.remove(start.offset, undefined, isComposing);
  lastComponent.remove(0, end.offset, isComposing);

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
  } else {
    delayUpdate(idList);
  }
};

export default backspace;