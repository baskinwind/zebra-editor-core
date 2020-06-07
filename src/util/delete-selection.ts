import focusAt from "../selection-operator/focus-at";
import { cursorType, getSelectedIdList } from "../selection-operator/util";
import { getComponentById } from "../components/util";

// 删除：删除 start - end 的内容，若开始与结束一致，则删除前一个字符
const deleteSelection = (start: cursorType, end?: cursorType) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    return;
  }

  let idList = getSelectedIdList(start.id, end.id);
  // 选中多行，需要阻止默认行为
  event?.preventDefault();
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getComponentById(idList[0]);
    let focus = component.remove(start.offset, end.offset);
    return focusAt(focus);
  }

  let firstComponent = getComponentById(idList[0]);
  let lastComponent = getComponentById(idList[idList.length - 1]);
  firstComponent.remove(start.offset);
  lastComponent.remove(0, end.offset);

  // 其他情况，删除中间行，首尾行合并
  lastComponent.send(firstComponent);
  for (let i = 1; i < idList.length - 1; i++) {
    getComponentById(idList[i]).removeSelf();
  }
  return focusAt({
    id: firstComponent.id,
    offset: start.offset
  });
};

export default deleteSelection;