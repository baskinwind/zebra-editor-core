import { cloneDeep } from "lodash";
import Editor from "../editor";
import { getUtf8TextLengthFromJsOffset } from "../util/text-util";
import { getElememtSize, getContainer, Cursor, getCursorElement, getOffset } from "./util";

export interface selectionType {
  isCollapsed: boolean;
  range: [Cursor, Cursor];
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

// 获取选区信息，从 range[0].id 组件的 offset 位置开始，到 range[1].id 的 offset 位置结束
const getSelection = (editor: Editor) => {
  let contentWindow = editor.mountedWindow;
  let section = contentWindow.getSelection();
  // 无选区：直接返回保存的选区内容
  if (!section || !section.anchorNode || !section.focusNode || section?.type === "None") {
    return cloneDeep<selectionType>(selectionStore);
  }
  let anchorNode = section.anchorNode as HTMLElement;

  // 当选区不在生成的文章中时，直接返回之前的选区对象
  let rootDom = contentWindow.document.getElementById("zebra-editor-contain");
  if (!rootDom?.contains(anchorNode)) {
    return cloneDeep<selectionType>(selectionStore);
  }

  // 选中 Article 节点
  if (rootDom === anchorNode || (anchorNode.dataset && anchorNode.dataset.type === "ARTICLE")) {
    let startBlock = rootDom;
    let endBlock = rootDom;
    while (startBlock.dataset && startBlock.dataset.structure !== "CONTENT") {
      startBlock = startBlock.children[0] as HTMLElement;
    }
    while (endBlock.dataset && endBlock.dataset.structure !== "CONTENT") {
      endBlock = endBlock.children[endBlock.children.length - 1] as HTMLElement;
    }
    selectionStore = {
      isCollapsed: section.isCollapsed,
      range: [
        {
          id: startBlock.id,
          offset: 0,
        },
        {
          id: endBlock.id,
          offset: -1,
        },
      ],
    };
    return cloneDeep<selectionType>(selectionStore);
  }

  // 选中 content 节点
  if (anchorNode.dataset && anchorNode.dataset.structure === "CONTENT") {
    let startParent: HTMLElement = getCursorElement(anchorNode);
    let offset = 0;
    for (let i = 0; i < section.anchorOffset; i++) {
      offset += getElememtSize(anchorNode.children[i] as HTMLElement);
    }
    selectionStore = {
      isCollapsed: true,
      range: [
        {
          id: startParent.id,
          offset: offset,
        },
        {
          id: startParent.id,
          offset: offset,
        },
      ],
    };
    return cloneDeep<selectionType>(selectionStore);
  }

  // 判断开始节点和结束节点的位置关系，
  // 0：同一节点
  // 2：focusNode 在 anchorNode 节点前
  // 4：anchorNode 在 focusNode 节点前
  // 获得选区的开始节点和结束节点（文档顺序）
  let posiType = section.anchorNode.compareDocumentPosition(section.focusNode);
  let anchorOffset = section.anchorOffset;
  let focusOffset = section.focusOffset;
  // EMOJI 标签会导致获取的光标的位置错误
  if (section.anchorNode.nodeType === 3) {
    anchorOffset = getUtf8TextLengthFromJsOffset(section.anchorNode.textContent, anchorOffset);
  }
  if (section.focusNode.nodeType === 3) {
    focusOffset = getUtf8TextLengthFromJsOffset(section.focusNode.textContent, focusOffset);
  }
  let startOffset;
  let startNode;
  let endOffset;
  let endNode;
  if (posiType === 0) {
    if (anchorOffset > focusOffset) {
      startOffset = focusOffset;
      startNode = section?.focusNode;
      endOffset = anchorOffset;
      endNode = section?.anchorNode;
    } else {
      startOffset = anchorOffset;
      startNode = section?.anchorNode;
      endOffset = focusOffset;
      endNode = section?.focusNode;
    }
  } else if (posiType === 2) {
    startOffset = focusOffset;
    startNode = section?.focusNode;
    endOffset = anchorOffset;
    endNode = section?.anchorNode;
  } else {
    startOffset = anchorOffset;
    startNode = section?.anchorNode;
    endOffset = focusOffset;
    endNode = section?.focusNode;
  }

  // 修正光标节点的位置
  // 获得光标距离所在段落的位置
  let startParagtaph: HTMLElement = getCursorElement(startNode as HTMLElement);
  let startContainer: HTMLElement = getContainer(startNode as HTMLElement);
  let endParagraph: HTMLElement = getCursorElement(endNode as HTMLElement);
  let endContainer: HTMLElement = getContainer(endNode as HTMLElement);
  startOffset = getOffset(startParagtaph, startContainer, startOffset);
  endOffset = getOffset(endParagraph, endContainer, endOffset);

  selectionStore = {
    isCollapsed: section?.isCollapsed === undefined ? true : section.isCollapsed,
    range: [
      {
        id: startParagtaph.id,
        offset: startOffset,
      },
      {
        id: endParagraph.id,
        offset: endOffset,
      },
    ],
  };

  return cloneDeep<selectionType>(selectionStore);
};

export default getSelection;
