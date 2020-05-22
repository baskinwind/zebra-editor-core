import { getElememtSize, getContainer, cursorType, getParent } from "./util";
import ComponentType from "../const/component-type";

export interface selectionType {
  isCollapsed: boolean;
  range: [cursorType, cursorType];
}

let selectionStore: selectionType = {
  isCollapsed: true,
  range: [
    {
      id: "",
      offset: 0,
    },
    {
      id: "",
      offset: 0,
    },
  ],
};

// 获取选区信息
const getSelection = () => {
  let root = document.getElementById("zebra-draft-root") as HTMLElement;
  let section = window.getSelection();
  let anchorNode = section?.anchorNode;
  let isArticleDom = (anchorNode as HTMLElement)?.dataset
    ? (anchorNode as HTMLElement)?.dataset.type === ComponentType.article
    : false;
  // 无选区，选区的焦点不在所在的根节点，以及选区的焦点在文章节点上时，直接返回之前的选区内容
  if (
    section?.type === "None" ||
    !root.contains(section?.anchorNode as Node) ||
    isArticleDom
  ) {
    return selectionStore;
  }
  let posiType = section?.anchorNode?.compareDocumentPosition(
    section?.focusNode as Node
  );
  let anchorOffect = section?.anchorOffset || 0;
  let focusOffset = section?.focusOffset || 0;
  let startOffset;
  let startNode;
  let endOffset;
  let endNode;
  // anchor 节点和 focus 节点在同一个元素内
  if (posiType === 0) {
    startOffset = Math.min(anchorOffect, focusOffset);
    endOffset = Math.max(anchorOffect, focusOffset);
    if (anchorOffect > focusOffset) {
      startOffset = focusOffset;
      startNode = section?.focusNode;
      endOffset = anchorOffect;
      endNode = section?.anchorNode;
    } else {
      startOffset = anchorOffect;
      startNode = section?.anchorNode;
      endOffset = focusOffset;
      endNode = section?.focusNode;
    }
  } else if (posiType === 2) {
    startOffset = focusOffset;
    startNode = section?.focusNode;
    endOffset = anchorOffect;
    endNode = section?.anchorNode;
  } else {
    startOffset = anchorOffect;
    startNode = section?.anchorNode;
    endOffset = focusOffset;
    endNode = section?.focusNode;
  }

  let startContainer: HTMLElement = getContainer(startNode);
  let startParent: HTMLElement = getParent(startNode);
  let endContainer: HTMLElement = getContainer(endNode);
  let endParent: HTMLElement = getParent(endNode);

  for (let i = 0; i < startParent.children.length; i++) {
    const element = startParent.children[i];
    if (element === startContainer) break;
    startOffset += getElememtSize(element as HTMLElement);
  }
  for (let i = 0; i < endParent.children.length; i++) {
    const element = endParent.children[i];
    if (element === endContainer) break;
    endOffset += getElememtSize(element as HTMLElement);
  }

  selectionStore = {
    isCollapsed:
      section?.isCollapsed === undefined ? true : section.isCollapsed,
    range: [
      {
        id: startParent.id,
        offset: startOffset,
      },
      {
        id: endParent.id,
        offset: endOffset,
      },
    ],
  };
  return selectionStore;
};

export default getSelection;
