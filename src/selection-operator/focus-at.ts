import { getElememtSize, cursorType, getCursorPosition } from "./util";

// 将光标定位在某个组件内 start 的后方，或是选中 start 到 end 的选区
const focusAt = (anchor: cursorType, focus?: cursorType) => {
  let anchorPosition = getCursorPosition(anchor);
  if (anchorPosition === null) return;
  let focusPosition = anchorPosition;
  if (focus !== undefined) {
    let temp = getCursorPosition(anchor);
    if (temp !== null) {
      focusPosition = temp;
    }
  }
  let section = window.getSelection();
  try {
    section?.removeAllRanges();
  } catch {}
  let range = new Range();
  console.log(anchorPosition, focusPosition);

  range.setStart(anchorPosition.node, anchorPosition.index);
  range.setEnd(focusPosition.node, focusPosition.index);
  // range.collapse();
  section?.addRange(range);
};

export default focusAt;
