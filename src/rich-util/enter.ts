import focusAt from "./focus-at";
import { cursorType, getSelectedIdList } from "../selection-operator/util";
import { getBlockById } from "../components/util";

// 在 start - end 处换行
const enter = (start: cursorType, end?: cursorType, event?: KeyboardEvent) => {
  event?.preventDefault();
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    let component = getBlockById(start.id);
    return focusAt(component.split(start.offset));
  }
  let idList = getSelectedIdList(start.id, end.id);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getBlockById(idList[0]);
    component.remove(start.offset, end.offset);
    return focusAt(component.split(start.offset));
  }

  // 选中多行
  let firstComponent = getBlockById(idList[0]);
  let lastComponent = getBlockById(idList[idList.length - 1]);
  firstComponent.remove(start.offset);
  lastComponent.remove(0, end.offset);
  for (let i = 1; i < idList.length - 1; i++) {
    getBlockById(idList[i]).removeSelf();
  }
  return focusAt({
    id: lastComponent.id,
    offset: 0
  });
};

export default enter;
