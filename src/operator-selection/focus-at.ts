import Component from "../components/component";
import { cursorType, getCursorPosition, getContainDocument } from "./util";
import { getBeforeSelection } from "./get-selection";
import nextTicket from "../util/next-ticket";

type focusAtType = cursorType | [Component, number, number];

// 选中 start 到 end 的内容
const focusAt = (start?: focusAtType, end?: cursorType) => {
  try {
    if (!start) {
      // 若无选区，则使用前一步的选区内容
      let selection = getBeforeSelection();
      start = selection.range[0];
      end = selection.range[1];
    }

    // 选区参数为数组形式
    if (Array.isArray(start)) {
      end = { id: start[0].id, offset: start[2] };
      start = { id: start[0].id, offset: start[1] };
    }
    // id 为空字符，说明刚初始化，不进行 focus
    if (start.id === "") return;
    if (!end) {
      end = { id: start.id, offset: start.offset };
    }

    let doc = getContainDocument();
    let block = doc.getElementById(start.id);
    if (!block) return;

    // 让 focus 的节点移入视口内
    nextTicket(() => {
      // @ts-ignore
      block?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    });

    start.offset = start.offset === -1 ? 0 : start.offset;
    end.offset = end.offset === -1 ? 0 : end.offset;
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
  } catch (e) {
    console.warn(e);
    let rootDom = getContainDocument().getElementById("zebra-editor-contain");
    rootDom?.blur();
  }
};

type focusNodeType = {
  node: Element | Node;
  index: number;
};

// 从开始节点的某处，选到接收节点的某处
const focusNode = (start: focusNodeType, end: focusNodeType = start) => {
  let doc = getContainDocument();
  let section = doc.getSelection();
  section?.removeAllRanges();
  let range = doc.createRange();

  if (
    start.node.nodeName === "IMG" ||
    start.node.nodeName === "AUDIO" ||
    start.node.nodeName === "VIDEO"
  ) {
    if (start.index === 0) {
      range.setStartBefore(start.node);
    }
    if (start.index === 1) {
      range.setStartAfter(start.node);
    }
  } else {
    let sureList = [...(start.node.textContent || "")];
    range.setStart(start.node, sureList.slice(0, start.index).join("").length);
  }
  if (
    end.node.nodeName === "IMG" ||
    end.node.nodeName === "AUDIO" ||
    end.node.nodeName === "VIDEO"
  ) {
    if (end.index === 0) {
      range.setEndBefore(end.node);
    }
    if (end.index === 1) {
      range.setEndAfter(end.node);
    }
  } else {
    let sureList = [...(end.node.textContent || "")];
    range.setEnd(end.node, sureList.slice(0, end.index).join("").length);
  }
  section?.addRange(range);
  if (!doc.hasFocus()) {
    let contentEdit = start.node.parentElement;
    while (contentEdit && contentEdit?.contentEditable !== "true") {
      contentEdit = contentEdit?.parentElement;
    }
    if (contentEdit) {
      contentEdit.focus();
    }
  }
  nextTicket(() => {
    document.dispatchEvent(new Event("editorchange"));
  });
};

export default focusAt;

export { focusNode };
