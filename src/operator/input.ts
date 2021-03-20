import Editor from "../editor/editor";
import Inline from "../components/inline";
import Character from "../components/character";
import focusAt from "../selection/focus-at";
import { getCursorPosition, Cursor } from "../selection/util";
import ContentCollection from "../components/content-collection";
import { getTextLength } from "../util/text-util";

const input = (
  editor: Editor,
  charOrInline: string | Inline,
  start: Cursor,
  event?: KeyboardEvent | CompositionEvent | InputEvent,
) => {
  try {
    let block = editor.storeManage.getBlockById(start.id);
    let offset = start.offset;
    let startPosition = getCursorPosition(editor.mountedWindow, start);
    if (!startPosition) return;
    let startNode = startPosition.node;

    // 样式边缘的空格，逃脱默认样式，优化体验
    if (
      block instanceof ContentCollection &&
      charOrInline === " " &&
      (startPosition.index <= 0 || startPosition.index >= getTextLength(startNode.nodeValue) - 1)
    ) {
      charOrInline = new Character(charOrInline);
    }

    // 强制更新
    if (
      start.offset === 0 ||
      startNode.nodeName === "BR" ||
      startNode.nodeName === "IMG" ||
      typeof charOrInline !== "string" ||
      (!event && typeof charOrInline === "string") ||
      startPosition.index === 0 ||
      startPosition.index >= getTextLength(startNode.nodeValue) - 1 ||
      event?.defaultPrevented
    ) {
      event?.preventDefault();
      let operator = block.add(offset, charOrInline);
      focusAt(editor.mountedWindow, operator[1], operator[2]);
      return;
    }

    // 普通的文字输入，不需要强制更新，默认行为不会破坏文档结构
    charOrInline =
      typeof charOrInline === "string" ? charOrInline.replace(/\n/g, "") : charOrInline;

    editor.articleManage.stopUpdate();
    block.add(offset, charOrInline);
    editor.articleManage.startUpdate();
  } catch (e) {
    console.warn(e);
  }
};

export default input;
