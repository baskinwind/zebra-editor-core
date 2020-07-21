import StructureType from "../const/structure-type";
import focusAt from "../operator-selection/focus-at";
import { cursorType, getSelectedIdList } from "../operator-selection/util";
import { getBlockById } from "../components/util";
import updateComponent from "../util/update-component";

// 删除：删除 start - end 的内容，若开始与结束一致，则删除前一个字符
const backspace = (
  start: cursorType,
  end?: cursorType,
  event?: KeyboardEvent | CompositionEvent
) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    let component = getBlockById(start.id);
    // 优化段落内删除逻辑，不需要整段更新
    if (
      event &&
      (component.structureType === StructureType.content ||
        component.structureType === StructureType.plainText)
    ) {
      if (start.offset <= 1 || start.offset >= component.getSize() - 1) {
        // 当删除发生在首位（或第一位）或最后一位时时，需要强制更新
        event?.preventDefault();
        return focusAt(component.remove(start.offset - 1, start.offset));
      }
      return component.remove(start.offset - 1, start.offset, true);
    }
    // 非文字组件删除需要强制更新
    event?.preventDefault();
    return focusAt(component.remove(start.offset, start.offset + 1));
  }

  let idList = getSelectedIdList(start.id, end.id);

  // 选中多行，需要阻止默认行为
  event?.preventDefault();
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = getBlockById(idList[0]);
    let focus = component.remove(start.offset, end.offset);
    return focusAt(focus);
  }

  let headBlock = getBlockById(idList[0]);
  let tailBlock = getBlockById(idList[idList.length - 1]);
  // 为了避免 send 时，组件不更新，此处需要开启更新
  let headFocus = headBlock.remove(start.offset);

  // 其他情况，删除中间行，首尾行合并
  for (let i = 1; i < idList.length - 1; i++) {
    getBlockById(idList[i]).removeSelf();
  }
  tailBlock.remove(0, end.offset);
  tailBlock.sendTo(headBlock);

  return focusAt({
    id: headFocus ? headFocus[0].id : "",
    offset: start.offset
  });
};

export default backspace;
