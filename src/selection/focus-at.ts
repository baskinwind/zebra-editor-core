import { Cursor, getCursorPosition } from "./util";
import { getJsTextLengthFromUtf8Offset } from "../util/text-util";
import Editor from "../editor";
import { nextTick } from "../util";

// 选中 start 到 end 的内容
const focusAt = (editor: Editor, start?: Cursor, end?: Cursor) => {
  if (!start) return;
  let contentWindow = editor.mountedWindow;
  try {
    // id 为空字符，说明刚初始化，不进行 focus
    if (start.id === "") return;
    if (!end) {
      end = { id: start.id, offset: start.offset };
    }

    let block = contentWindow.document.getElementById(start.id);
    if (!block) return;

    block?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });

    start.offset = start.offset === -1 ? 0 : start.offset;
    end.offset = end.offset === -1 ? 0 : end.offset;
    let startPosition = getCursorPosition(contentWindow, start);
    if (!startPosition) return;
    let endPosition = startPosition;
    if (end) {
      let temp = getCursorPosition(contentWindow, end);
      if (temp) {
        endPosition = temp;
      }
    }
    focusNode(contentWindow, startPosition, endPosition);
  } catch (e) {
    console.warn(e);
    let rootDom = contentWindow.document.getElementById("zebra-editor-contain");
    rootDom?.blur();
  }
};

type FocusNodeType = {
  node: Element | Node;
  index: number;
};

// 从开始节点的某处，选到接收节点的某处
const focusNode = (contentWindow: Window, start: FocusNodeType, end: FocusNodeType = start) => {
  let doc = contentWindow.document;
  let section = contentWindow.getSelection();
  section?.removeAllRanges();
  let range = doc.createRange();

  if (
    start.node.nodeName === "IMG" ||
    start.node.nodeName === "AUDIO" ||
    start.node.nodeName === "VIDEO" ||
    (start.node as HTMLElement).contentEditable === "false"
  ) {
    if (start.index === 0) {
      range.setStartBefore(start.node);
    }
    if (start.index === 1) {
      range.setStartAfter(start.node);
    }
  } else {
    range.setStart(start.node, getJsTextLengthFromUtf8Offset(start.node.textContent, start.index));
  }

  if (
    end.node.nodeName === "IMG" ||
    end.node.nodeName === "AUDIO" ||
    end.node.nodeName === "VIDEO" ||
    (end.node as HTMLElement).contentEditable === "false"
  ) {
    if (end.index === 0) {
      range.setEndBefore(end.node);
    }
    if (end.index === 1) {
      range.setEndAfter(end.node);
    }
  } else {
    range.setEnd(end.node, getJsTextLengthFromUtf8Offset(end.node.textContent, end.index));
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

  nextTick(() => {
    document.dispatchEvent(new Event("editorChange"));
  });
};

export default focusAt;

export { focusNode };
