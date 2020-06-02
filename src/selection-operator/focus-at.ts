import { cursorType, getCursorPosition } from "./util";
import getSelection, { getBeforeSelection } from "./get-selection";

// 选中 start 到 end 的内容
const focusAt = (
  start?: cursorType | [{ id: string; [key: string]: any }, number, number],
  end?: cursorType
) => {
  if (!start) {
    let selection = getBeforeSelection();
    start = selection.range[0];
    end = selection.range[1];
  }
  if (Array.isArray(start)) {
    end = { id: start[0].id, offset: start[2] };
    start = { id: start[0].id, offset: start[1] };
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
  focusNode(startPosition, endPosition);
};

type focusNodeType = {
  node: Element | Node;
  index: number;
};

const focusNode = (start: focusNodeType, end: focusNodeType = start) => {
  let section = window.getSelection();
  section?.removeAllRanges();
  let range = new Range();
  if (start.node instanceof HTMLImageElement) {
    if (start.index === 0) {
      range.setStartBefore(start.node);
    }
    if (start.index === 1) {
      range.setStartAfter(start.node);
    }
  } else {
    range.setStart(start.node, start.index);
  }
  if (end.node instanceof HTMLImageElement) {
    if (end.index === 0) {
      range.setEndBefore(end.node);
    }
    if (end.index === 1) {
      range.setEndAfter(end.node);
    }
  } else {
    range.setEnd(end.node, end.index);
  }
  section?.addRange(range);
};

export default focusAt;

export { focusNode };
