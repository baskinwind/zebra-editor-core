import Editor from "../editor";
import focusAt from "../selection/focus-at";
import { getSelectedIdList } from "../selection/get-selected-id-list";
import { Cursor } from "../selection/util";

// 删除 start 到 end 的内容
const deleteSelection = (editor: Editor, start: Cursor, end?: Cursor) => {
  // 没有选区不操作
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    return;
  }

  let idList = getSelectedIdList(editor.article, start.id, end.id);
  // 选中多行
  if (idList.length === 0) return;

  if (idList.length === 1) {
    let block = editor.storeManage.getBlockById(idList[0]);
    let operator = block.remove(start.offset, end.offset);
    return focusAt(editor.mountedWindow, operator[1], operator[2]);
  }

  let headBlock = editor.storeManage.getBlockById(idList[0]);
  let tailBlock = editor.storeManage.getBlockById(idList[idList.length - 1]);

  // 删除选中内容
  headBlock.remove(start.offset, -1);
  for (let i = 1; i < idList.length - 1; i++) {
    editor.storeManage.getBlockById(idList[i]).removeSelf();
  }
  tailBlock.remove(0, end.offset);

  // 首尾行合并
  tailBlock.sendTo(headBlock);

  return focusAt(editor.mountedWindow, {
    id: headBlock.id,
    offset: start.offset,
  });
};

export default deleteSelection;
