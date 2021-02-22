import Editor from "../editor/editor";
import StructureType from "../const/structure-type";
import getSelection from "../selection/get-selection";
import deleteSelection from "../operator/delete-selection";
import focusAt from "../selection/focus-at";

// 复制内容
const onPaste = (editor: Editor, event: ClipboardEvent) => {
  event.preventDefault();
  // 获取复制的内容
  let copyInData = event.clipboardData?.getData("text/plain");
  if (!copyInData) return;
  let rowData = copyInData.split("\n");
  if (rowData.length === 0) return;

  // 移除选中区域
  let selection = getSelection(editor.mountedWindow);
  if (!selection.isCollapsed) {
    deleteSelection(editor, selection.range[0], selection.range[1]);
    selection = getSelection(editor.mountedWindow);
  }

  let nowComponent = editor.storeManage.getBlockById(selection.range[0].id);
  let index = selection.range[0].offset;

  // 纯文本组件直接输入即可
  if (nowComponent.structureType === StructureType.plainText) {
    focusAt(editor.mountedWindow, nowComponent.add(rowData.join("\n"), index));
    return;
  }

  // 过滤掉空行
  rowData = rowData.filter((item) => {
    return item.trim().length !== 0;
  });

  let focus = nowComponent.add(rowData[0], index);
  if (rowData.length === 1) {
    return focusAt(editor.mountedWindow, focus);
  }

  let list = [];
  for (let i = 1; i < rowData.length; i++) {
    list.push(editor.componentFactory.buildParagraph(rowData[i]));
  }
  focus = nowComponent.split(index + rowData[0].length, list);
  let endId = focus![0].id;
  focusAt(editor.mountedWindow, {
    id: endId,
    offset: rowData[rowData.length - 1].length,
  });
  return;
};

export default onPaste;
