import focusAt from "../operator-selection/focus-at";
import { cursorType, getSelectedIdList } from "../operator-selection/util";
import { getBlockById } from "../components/util";

// 删除 start - end 的内容
const deleteSelection = (start: cursorType, end?: cursorType) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    return;
  }
  let idList = getSelectedIdList(start.id, end.id);
  // 选中多行
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let block = getBlockById(idList[0]);
    let focus = block.remove(start.offset, end.offset);
    return focusAt(focus);
  }

  let headBlock = getBlockById(idList[0]);
  let tailBlock = getBlockById(idList[idList.length - 1]);
  headBlock.remove(start.offset);

  // 其他情况，删除中间行，首尾行合并
  for (let i = 1; i < idList.length - 1; i++) {
    getBlockById(idList[i]).removeSelf();
  }

  tailBlock.remove(0, end.offset);
  tailBlock.sendTo(headBlock);

  return focusAt({
    id: headBlock.id,
    offset: start.offset
  });
};

export default deleteSelection;
