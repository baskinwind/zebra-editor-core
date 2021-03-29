import Editor from "../editor";
import StructureType from "../const/structure-type";
import getSelection from "../selection/get-selection";
import deleteSelection from "./delete-selection";
import focusAt from "../selection/focus-at";

// 复制内容
const paste = (editor: Editor, event: ClipboardEvent) => {
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
  let start = selection.range[0];

  // 纯文本组件直接输入即可
  if (nowComponent.type === StructureType.plainText) {
    let operator = nowComponent.add(start.offset, rowData.join("\n"));
    focusAt(editor.mountedWindow, operator?.[0] || start, operator?.[1]);
    return;
  }

  // 过滤掉空行
  rowData = rowData.filter((each) => each.trim().length !== 0);

  let operator = nowComponent.add(start.offset, rowData[0]);
  if (rowData.length === 1) {
    return focusAt(editor.mountedWindow, operator?.[0] || start, operator?.[1]);
  }

  let list = [];
  for (let i = 1; i < rowData.length; i++) {
    list.push(editor.componentFactory.buildParagraph(rowData[i]));
  }
  operator = nowComponent.split(start.offset + rowData[0].length, ...list);
  focusAt(editor.mountedWindow, {
    id: list[0].id,
    offset: rowData[rowData.length - 1].length,
  });
  return;
};

export default paste;
