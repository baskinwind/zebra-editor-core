import Inline from "../components/inline";
import Character from "../components/character";
import InlineImage from "../components/inline-image";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt from "./focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition } from "./util";

const input = (charOrInline: string | Inline, event?: Event) => {
  deleteSelection();
  let selection = getSelection();
  if (selection.selectStructure) return;
  let component = getComponentById(selection.range[0].id);
  let offset = selection.range[0].offset;
  let startPosition = getCursorPosition(selection.range[0]);
  if (!startPosition) return;
  let startNode = startPosition.node;
  let escape =
    charOrInline === " " &&
    (startPosition.index === 0 ||
      startPosition.index === startNode.nodeValue?.length);

  if (
    startNode instanceof HTMLBRElement ||
    escape ||
    charOrInline instanceof Character
  ) {
    let inline =
      typeof charOrInline === "string"
        ? new Character(charOrInline)
        : charOrInline;
    focusAt(component.add(inline, offset));
    return;
  }

  component.add(charOrInline, offset, true);
  let node = startPosition?.node;
  if (!node) return;
  if (typeof charOrInline === "string") {
    node.nodeValue = `${node.nodeValue?.slice(
      0,
      startPosition?.index
    )}${charOrInline}${node.nodeValue?.slice(startPosition?.index)}`;
    return focusAt({
      id: component.id,
      offset: offset + 1,
    });
  }
  if (charOrInline instanceof InlineImage) {
    if (node instanceof HTMLImageElement) {
      node.parentElement?.replaceWith(
        node.parentElement,
        charOrInline.render()
      );
    } else {
      let nodeParent = node.parentElement;
      if (!nodeParent) return;
      let nodeClone = nodeParent.cloneNode(true);
      node.nodeValue = node.nodeValue?.slice(0, startPosition?.index) || "";
      nodeClone.childNodes[0].nodeValue =
        nodeClone.childNodes[0].nodeValue?.slice(startPosition?.index) || "";
      nodeParent.replaceWith(nodeParent, charOrInline.render(), nodeClone);
    }
    return focusAt({
      id: component.id,
      offset: offset + 1,
    });
  }
};

export default input;
