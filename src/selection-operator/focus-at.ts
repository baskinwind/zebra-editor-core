import { cursorType, getCursorPosition } from "./util";

// 将光标定位在某个组件内 start 的后方，或是选中 start 到 end 的选区
const focusAt = (start: cursorType, end?: cursorType) => {
  let startPosition = getCursorPosition(start);
  if (!startPosition) return;
  let endPosition = startPosition;
  if (end) {
    let temp = getCursorPosition(end);
    if (temp) {
      endPosition = temp;
    }
  }
  let section = window.getSelection();
  try {
    section?.removeAllRanges();
  } catch { }
  let range = new Range();
  range.setStart(startPosition.node, startPosition.index);
  range.setEnd(endPosition.node, endPosition.index);
  section?.addRange(range);
};

export default focusAt;
