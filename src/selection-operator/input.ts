import Inline from "../components/inline";
import Character from "../components/character";
import InlineImage from "../components/inline-image";
import getSelection from "./get-selection";
import deleteSelection from "./delete-selection";
import focusAt, { focusNode } from "./focus-at";
import { getComponentById } from "../components/util";
import { getCursorPosition } from "./util";
import { needUpdate } from "./update-component";

const input = (
  charOrInline: string | Inline,
  isComposition: boolean = false,
  event?: KeyboardEvent
) => {
  // 输入前，删除选取内容
  deleteSelection();
  let selection = getSelection();
  // 选中结构时，放弃输入
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
  // 样式边缘的空格，逃脱该样式，优化体验
  if (
    charOrInline == "\n" ||
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
    let focus = component.add(charOrInline, offset);
    console.log(focus);
    return focusAt(focus);
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
};

export default input;
