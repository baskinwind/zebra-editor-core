import Inline from "../components/inline";
import Character from "../components/character";
import InlineImage from "../components/inline-image";
import focusAt, { focusNode } from "../operator-selection/focus-at";
import { getBlockById } from "../components/util";
import {
  getCursorPosition,
  cursorType,
  getContainer
} from "../operator-selection/util";
import updateComponent, { needUpdate } from "../util/update-component";
import ContentCollection from "../components/content-collection";

const input = (
  charOrInline: string | Inline,
  start: cursorType,
  event?: KeyboardEvent | CompositionEvent | InputEvent
) => {
  try {
    let component = getBlockById(start.id);
    let offset = start.offset;
    let startPosition = getCursorPosition(start);
    if (!startPosition) return;
    let startNode = startPosition.node;
    // 样式边缘的空格，逃脱默认样式，优化体验
    if (
      component instanceof ContentCollection &&
      charOrInline === " " &&
      (startPosition.index === 0 ||
        startPosition.index >= [...(startNode.nodeValue || "")].length - 1)
    ) {
      charOrInline = new Character(charOrInline);
    }

    // 插入图片时，不强制更新，但要生成符合要求的文档，并手动更正光标位置
    let node = startPosition?.node;
    if (charOrInline instanceof InlineImage) {
      event?.preventDefault();
      component.add(charOrInline, offset, true);
      let container = getContainer(node);
      let newInline = charOrInline.render();
      if (node.nodeName === "IMG") {
        container.replaceWith(container, newInline);
      } else {
        let nodeParent = node.parentElement;
        if (!nodeParent) return;
        if (startPosition?.index === 0) {
          container.replaceWith(newInline, container);
        } else if (startPosition?.index === node.nodeValue?.length) {
          container.replaceWith(container, newInline);
        } else {
          updateComponent(component);
          focusAt({
            id: component.id,
            offset: offset + 1
          });
          return;
        }
      }
      return focusNode({ node: newInline.children[0], index: 1 });
    }

    // 强制更新
    if (
      start.offset === 0 ||
      needUpdate() ||
      startNode.nodeName === "BR" ||
      startNode.nodeName === "IMG" ||
      charOrInline instanceof Character ||
      (!event && typeof charOrInline === "string") ||
      startPosition.index === 0 ||
      startPosition.index >= [...(startNode.nodeValue || "")].length - 1 ||
      event?.defaultPrevented
    ) {
      event?.preventDefault();
      focusAt(component.add(charOrInline, offset));
      return;
    }
    // 普通的文字输入，不需要强制更新，默认行为不会破坏文档结构
    component.add(charOrInline, offset, true);
  } catch (e) {
    console.warn(e);
  }
};

export default input;
