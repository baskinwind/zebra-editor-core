import deleteSelection from "../selection-operator/delete-selection";
import getSelection from "../selection-operator/get-selection";
import Paragraph from "../components/paragraph";
import focusAt from "../selection-operator/focus-at";
import { getComponentById } from "../components/util";

// 复制内容
const onPaste = (event: ClipboardEvent) => {
  let copyInData = event.clipboardData?.getData("text/plain");
  if (!copyInData) return;
  let rowData = copyInData.split("\n").filter((item) => item);
  if (rowData.length === 0) return;
  deleteSelection();
  let selection = getSelection();
  let nowComponent = getComponentById(selection.range[0].id);
  let index = selection.range[0].offset;
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
  return focusAt({
    id: endId,
    offset: rowData[rowData.length - 1].length
  });
};

export default onPaste;
