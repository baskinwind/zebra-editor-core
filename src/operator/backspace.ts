import Editor from "../editor/editor";
import StructureType from "../const/structure-type";
import focusAt from "../selection/focus-at";
import { Cursor } from "../selection/util";
import deleteSelection from "./delete-selection";

// 删除：删除 start 到 end 的内容
const backspace = (
  editor: Editor,
  start: Cursor,
  end: Cursor = start,
  event?: KeyboardEvent | CompositionEvent,
) => {
  // 光标状态时处理，默认删除前一个字符
  if (start.id === end.id && start.offset === end.offset) {
    let block = editor.storeManage.getBlockById(start.id);

    // 优化段落内删除逻辑，不需要整段更新
    if (event && [StructureType.content, StructureType.plainText].includes(block.structureType)) {
      // 当删除发生在首位时，需要强制更新
      if (start.offset === 0) {
        event?.preventDefault();
        let operator = block.remove(-1, 0);
        return focusAt(editor.mountedWindow, operator[1], operator[2]);
      }

      editor.articleManage.stopUpdate();
      block.remove(start.offset - 1, start.offset);
      editor.articleManage.startUpdate();
      return;
    }

    // 非文字组件删除需要强制更新
    event?.preventDefault();
    let operator = block.remove(start.offset, start.offset + 1);
    return focusAt(editor.mountedWindow, operator[1], operator[2]);
  }

  // 选区状态时处理，需要阻止默认行为
  event?.preventDefault();
  deleteSelection(editor, start, end);
};

export default backspace;
