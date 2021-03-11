import Editor from "../editor/editor";
import StructureType from "../const/structure-type";
import focusAt from "../selection/focus-at";
import { Cursor, getSelectedIdList } from "../selection/util";

// 删除：删除 start 到 end 的内容
const backspace = (
  editor: Editor,
  start: Cursor,
  end?: Cursor,
  event?: KeyboardEvent | CompositionEvent,
) => {
  // 若开始与结束一致，则删除前一个字符
  if (!end || (start.id === end.id && start.offset === end.offset)) {
    let block = editor.storeManage.getBlockById(start.id);

    // 优化段落内删除逻辑，不需要整段更新
    if (
      event &&
      [StructureType.content, StructureType.plainText].includes(
        block.structureType,
      )
    ) {
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

  let idList = getSelectedIdList(editor.article, start.id, end.id);

  // 选中多行，需要阻止默认行为
  event?.preventDefault();
  if (idList.length === 0) return;

  if (idList.length === 1) {
    let component = editor.storeManage.getBlockById(idList[0]);
    let operator = component.remove(start.offset, end.offset);
    return focusAt(editor.mountedWindow, operator[1], operator[2]);
  }

  let headBlock = editor.storeManage.getBlockById(idList[0]);
  let tailBlock = editor.storeManage.getBlockById(idList[idList.length - 1]);

  // 删除选中内容
  headBlock.remove(start.offset, 0);
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

export default backspace;
