import Inline from "../components/inline";
import Character from "../components/character";
import InlineImage from "../components/inline-image";
import focusAt, { focusNode } from "../selection-operator/focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition, cursorType } from "../selection-operator/util";
import { needUpdate } from "../selection-operator/update-component";

const input = (
  charOrInline: string | Inline,
  start: cursorType,
  event?: KeyboardEvent
) => {
  try {
    let component = getComponentById(start.id);
    let offset = start.offset;
    let startPosition = getCursorPosition(start);
    if (!startPosition) return;
    let startNode = startPosition.node;
    // 样式边缘的空格，逃脱默认样式，优化体验
    if (
      charOrInline === " " &&
      (startPosition.index === 0 ||
        startPosition.index === startNode.nodeValue?.length)
    ) {
      charOrInline = new Character(charOrInline);
    }

    // 强制更新
    if (
      startNode instanceof HTMLImageElement ||
      startNode instanceof HTMLBRElement ||
      charOrInline instanceof Character ||
      needUpdate() ||
      event?.defaultPrevented
    ) {
      event?.preventDefault();
      focusAt(component.add(charOrInline, offset));
      return;
    }

    // 普通的文字输入，不需要强制更新，默认行为不会破坏文档结构
    component.add(charOrInline, offset, true);
    // 插入图片时，不强制更新，但要生成符合要求的文档，并手动更正光标位置
    let node = startPosition?.node;
    if (charOrInline instanceof InlineImage) {
      let newInline = charOrInline.render();
      if (node instanceof HTMLImageElement) {
        node.parentElement?.replaceWith(node.parentElement, newInline);
      } else {
        let nodeParent = node.parentElement;
        if (!nodeParent) return;
        let nodeClone = nodeParent.cloneNode(true);
        node.nodeValue = node.nodeValue?.slice(0, startPosition?.index) || "";
        nodeClone.childNodes[0].nodeValue =
          nodeClone.childNodes[0].nodeValue?.slice(startPosition?.index) || "";
        nodeParent.replaceWith(nodeParent, newInline, nodeClone);
      }
      return focusNode({ node: newInline, index: 1 });
    }
  } catch (e) {
    console.error(e);
  }
};

export default input;
