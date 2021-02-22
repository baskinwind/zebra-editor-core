import Editor from "../editor/editor";
import focusAt from "../selection/focus-at";
import { cursorType, getSelectedIdList } from "../selection/util";

// 删除 start - end 的内容
const deleteSelection = (
  editor: Editor,
  start: cursorType,
  end?: cursorType,
) => {
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    return;
  }

  let idList = getSelectedIdList(editor.article, start.id, end.id);
  // 选中多行
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let block = editor.storeManage.getBlockById(idList[0]);
    let focus = block.remove(start.offset, end.offset);
    return focusAt(editor.mountedWindow, focus);
  }

  let headBlock = editor.storeManage.getBlockById(idList[0]);
  let tailBlock = editor.storeManage.getBlockById(idList[idList.length - 1]);
  headBlock.remove(start.offset);

  // 其他情况，删除中间行，首尾行合并
  for (let i = 1; i < idList.length - 1; i++) {
    editor.storeManage.getBlockById(idList[i]).removeSelf();
  }

  tailBlock.remove(0, end.offset);
  tailBlock.sendTo(headBlock);

  return focusAt(editor.mountedWindow, {
    id: headBlock.id,
    offset: start.offset,
  });
};

export default deleteSelection;
