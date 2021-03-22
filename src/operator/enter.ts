import Editor from "../editor";
import focusAt from "../selection/focus-at";
import { getSelectedIdList } from "../selection/get-selected-id-list";
import { Cursor } from "../selection/util";

// 在 start - end 处换行
const enter = (editor: Editor, start: Cursor, end: Cursor = start, event?: KeyboardEvent) => {
  event?.preventDefault();
  let idList = getSelectedIdList(editor.article, start.id, end.id);
  if (idList.length === 0) return;

  if (idList.length === 1) {
    let component = editor.storeManage.getBlockById(idList[0]);
    component.remove(start.offset, end.offset);
    let operator = component.split(start.offset);
    return focusAt(editor.mountedWindow, operator[1], operator[2]);
  }

  // 选中多行
  let firstComponent = editor.storeManage.getBlockById(idList[0]);
  let lastComponent = editor.storeManage.getBlockById(idList[idList.length - 1]);
  firstComponent.remove(start.offset);
  lastComponent.remove(0, end.offset);
  for (let i = 1; i < idList.length - 1; i++) {
    editor.storeManage.getBlockById(idList[i]).removeSelf();
  }
  focusAt(editor.mountedWindow, {
    id: lastComponent.id,
    offset: 0,
  });
  return;
};

export default enter;
