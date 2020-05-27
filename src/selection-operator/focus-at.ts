import { cursorType, getCursorPosition } from "./util";

// 选中 start 到 end 的内容
const focusAt = (
  start:
    | cursorType
    | [{ id: string; [key: string]: any }, number, number]
    | undefined,
  end?: cursorType
) => {
  if (!start) return;
  if (Array.isArray(start)) {
    start = { id: start[0].id, offset: start[1] };
    end = { id: start[0].id, offset: start[2] };
  }
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
  section?.removeAllRanges();
  let range = new Range();
  if (startPosition.node instanceof HTMLImageElement) {
    if (startPosition.index === 0) {
      range.setStartBefore(startPosition.node);
    }
    if (startPosition.index === 1) {
      range.setStartAfter(startPosition.node);
    }
  } else {
    range.setStart(startPosition.node, startPosition.index);
  }
  if (endPosition.node instanceof HTMLImageElement) {
    if (endPosition.index === 0) {
      range.setEndBefore(endPosition.node);
    }
    if (endPosition.index === 1) {
      range.setEndAfter(endPosition.node);
    }
  } else {
    range.setEnd(endPosition.node, endPosition.index);
  }
  section?.addRange(range);
};

export default focusAt;
