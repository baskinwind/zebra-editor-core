import deleteSelection from "./delete-selection";
import getSelection from "./get-selection";
import Paragraph from "../components/paragraph";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";

const onPaste = (event: ClipboardEvent) => {
  let copyInData = event.clipboardData?.getData("text/plain");
  if (!copyInData) return;
  let rowData = copyInData.split("\n").filter((item) => item);
  if (rowData.length === 0) return;
  deleteSelection();
  let selection = getSelection();
  let nowComponent = getComponentById(selection.range[0].id);
  let index = selection.range[0].offset;
  nowComponent.add(rowData[0], index);
  if (rowData.length === 1) {
    return;
  }
  nowComponent.add(rowData[rowData.length - 1], index + rowData[0].length);
  let list = [];
  for (let i = 1; i < rowData.length - 1; i++) {
    list.push(new Paragraph(rowData[i]));
  }
  let focus = nowComponent.split(index + rowData[0].length, list);
  let endId = focus![0].id;
  return focusAt({
    id: endId,
    offset: rowData[rowData.length - 1].length
  });
};

export default onPaste;
