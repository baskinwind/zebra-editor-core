import Paragraph from "../components/paragraph";
import getSelection from "../selection-operator/get-selection";
import deleteSelection from "./delete-selection";
import StructureType from "../const/structure-type";
import focusAt from "../selection-operator/focus-at";
import { getComponentById } from "../components/util";

// 复制内容
const onPaste = (event: ClipboardEvent) => {
  let copyInData = event.clipboardData?.getData("text/plain");
  if (!copyInData) return;
  let rowData = copyInData.split("\n");
  if (rowData.length === 0) return;

  let selection = getSelection();
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  let nowComponent = getComponentById(selection.range[0].id);
  let index = selection.range[0].offset;

  // 纯文本组件直接输入即可
  if (nowComponent.structureType === StructureType.plainText) {
    focusAt(nowComponent.add(rowData.join("\n"), index));
    return;
  }

  let focus = nowComponent.add(rowData[0], index, rowData.length !== 1);
  if (rowData.length === 1) {
    return focusAt(focus);
  }
  nowComponent.add(
    rowData[rowData.length - 1],
    index + rowData[0].length,
    true
  );
  let list = [];
  for (let i = 1; i < rowData.length - 1; i++) {
    list.push(new Paragraph(rowData[i]));
  }
  focus = nowComponent.split(index + rowData[0].length, list);
  let endId = focus![0].id;
  focusAt({
    id: endId,
    offset: rowData[rowData.length - 1].length
  });
  return;
};

export default onPaste;
