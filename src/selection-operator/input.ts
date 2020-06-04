import Inline from "../components/inline";
import Character from "../components/character";
import InlineImage from "../components/inline-image";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt, { focusNode } from "./focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition } from "./util";

const input = (
  charOrInline: string | Inline,
  isComposition: boolean = false,
  event?: KeyboardEvent
) => {
  deleteSelection();
  let selection = getSelection();
  if (selection.selectStructure) return;
  // 修正混合输入时，光标位置获取错误的问题
  if (isComposition && typeof charOrInline === "string") {
    selection.range[0].offset -= charOrInline.length;
    selection.range[1].offset -= charOrInline.length;
  }
  let component = getComponentById(selection.range[0].id);
  let offset = selection.range[0].offset;
  let startPosition = getCursorPosition(selection.range[0]);
  if (!startPosition) return;
  let startNode = startPosition.node;
  if (
    charOrInline === " " &&
    (startPosition.index === 0 ||
      startPosition.index === startNode.nodeValue?.length)
  ) {
    charOrInline = new Character(charOrInline);
  }

  if (
    (startNode instanceof HTMLImageElement &&
      typeof charOrInline === "string") ||
    startNode instanceof HTMLBRElement ||
    charOrInline instanceof Character
  ) {
    event?.preventDefault();
    return focusAt(component.add(charOrInline, offset));
  }

  component.add(charOrInline, offset, true);
  let node = startPosition?.node;
  // if (typeof charOrInline === "string") {
  //   if (isComposition) {
  //     return;
  //   }
  //   node.nodeValue = `${node.nodeValue?.slice(
  //     0,
  //     startPosition?.index
  //   )}${charOrInline}${node.nodeValue?.slice(startPosition?.index)}`;
  //   return focusNode({ node: node, index: startPosition?.index + 1 });
  // }

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
};

export default input;
