import { getComponentFactory } from "../components";
import getSelection from "../operator-selection/get-selection";
import deleteSelection from "../operator/delete-selection";
import StructureType from "../const/structure-type";
import focusAt from "../operator-selection/focus-at";
import { getBlockById } from "../components/util";
import { createRecord } from "../record/util";

// 复制内容
const onPaste = (event: ClipboardEvent) => {
  event.preventDefault();
  let copyInData = event.clipboardData?.getData("text/plain");
  if (!copyInData) return;
  let rowData = copyInData.split("\n");
  if (rowData.length === 0) return;

  let selection = getSelection();
  if (!selection.isCollapsed) {
    deleteSelection(selection.range[0], selection.range[1]);
    selection = getSelection();
  }
  createRecord(selection.range[0], selection.range[1]);
  let nowComponent = getBlockById(selection.range[0].id);
  let index = selection.range[0].offset;

  // 纯文本组件直接输入即可
  if (nowComponent.structureType === StructureType.plainText) {
    focusAt(nowComponent.add(rowData.join("\n"), index));
    return;
  }

  // 过滤掉空行
  rowData = rowData.filter((item) => {
    return item.trim().length !== 0;
  });
  let focus = nowComponent.add(rowData[0], index);
  if (rowData.length === 1) {
    return focusAt(focus);
  }
  let list = [];
  for (let i = 1; i < rowData.length; i++) {
    list.push(getComponentFactory().buildParagraph(rowData[i]));
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
