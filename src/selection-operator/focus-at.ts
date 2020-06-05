import Component from "../components/component";
import { cursorType, getCursorPosition } from "./util";
import { getBeforeSelection } from "./get-selection";

type focusAtType = cursorType | [Component, number, number];

// 选中 start 到 end 的内容
const focusAt = (start?: focusAtType, end?: cursorType) => {
  // 若无选区，则使用前一步的选区内容
  if (!start) {
    let selection = getBeforeSelection();
    start = selection.range[0];
    end = selection.range[1];
  }
  // 选区参数为数组形式
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

// 从开始节点的某处，选到接收节点的某处
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
