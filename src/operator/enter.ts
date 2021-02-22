import focusAt from "../selection/focus-at";
import { cursorType, getSelectedIdList } from "../selection/util";
import { getBlockById } from "../components/util";
import Editor from "../editor/editor";

// 在 start - end 处换行
const enter = (
  editor: Editor,
  start: cursorType,
  end?: cursorType,
  event?: KeyboardEvent,
) => {
  event?.preventDefault();
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    let component = editor.storeManage.getBlockById(start.id);
    focusAt(editor.mountedWindow, component.split(start.offset));
    return;
  }

  let idList = getSelectedIdList(editor.article, start.id, end.id);
  if (idList.length === 0) return;
  if (idList.length === 1) {
    let component = editor.storeManage.getBlockById(idList[0]);
    component.remove(start.offset, end.offset);
    focusAt(editor.mountedWindow, component.split(start.offset));
    return;
  }

  // 选中多行
  let firstComponent = editor.storeManage.getBlockById(idList[0]);
  let lastComponent = editor.storeManage.getBlockById(
    idList[idList.length - 1],
  );
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
