import ComponentType from "../const/component-type";
import { getElememtSize, getContainer, cursorType, getParent } from "./util";
import { getComponentById } from "../components/util";
import Article from "../components/article";

export interface selectionType {
  isCollapsed: boolean;
  selectStructure?: boolean;
  range: [cursorType, cursorType];
}

let selectionStore: selectionType = {
  isCollapsed: true,
  selectStructure: false,
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

const flushSelection = () => {
  if (selectionStore.range[0].id && selectionStore.range[1].id) return;
  getSelection();
};

// 获取选区信息
const getSelection = () => {
  let root = [...document.querySelectorAll(".zebra-draft-root")];
  if (!root) return selectionStore;
  let section = window.getSelection();
  // 无选区，直接返回之前的选区内容
  if (
    !section ||
    !section.anchorNode ||
    !section.focusNode ||
    section?.type === "None"
  )
    return selectionStore;
  // 光标焦点不在根节点内，直接返回之前的选区内容
  if (!root.some((item) => item.contains(section!.anchorNode)))
    return selectionStore;
  // 光标焦点在 Article 组件上，直接返回之前的选区内容
  let anchorNode = section?.anchorNode;
  if (
    anchorNode instanceof HTMLElement &&
    anchorNode.dataset.type === ComponentType.article
  ) {
    if (section.anchorOffset > 0) {
      let article = getComponentById<Article>('article');
      let child = article.children.get(section.anchorOffset - 1);
      return {
        isCollapsed: true,
        selectStructure: true,
        range: [{
          id: child?.id || '',
          offset: section.anchorOffset
        }, {
          id: child?.id || '',
          offset: section.anchorOffset
        }]
      };
    }
    return selectionStore;
  }
  // 判断开始节点和结束节点的位置关系，0：同一节点，2：focusNode 在 anchorNode 节点前，4：anchorNode 在 focusNode 节点前
  let posiType = section.anchorNode.compareDocumentPosition(section.focusNode);
  let anchorOffect = section.anchorOffset;
  let focusOffset = section.focusOffset;
  let startOffset;
  let startNode;
  let endOffset;
  let endNode;
  // 获得选取的开始节点和结束节点
  if (posiType === 0) {
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
  // 修正光标节点的位置
  // 获得光标距离所在段落的位置
  let startContainer: HTMLElement = getContainer(startNode);
  let startParent: HTMLElement = getParent(startNode);
  let endContainer: HTMLElement = getContainer(endNode);
  let endParent: HTMLElement = getParent(endNode);

  if (
    startParent !== startContainer &&
    startParent.dataset.type === ComponentType.paragraph
  ) {
    for (let i = 0; i < startParent.children.length; i++) {
      const element = startParent.children[i];
      if (element === startContainer) break;
      startOffset += getElememtSize(element);
    }
  }
  if (
    endParent !== endContainer &&
    endParent.dataset.type === ComponentType.paragraph
  ) {
    for (let i = 0; i < endParent.children.length; i++) {
      const element = endParent.children[i];
      if (element === endContainer) break;
      endOffset += getElememtSize(element);
    }
  }

  // 修复：当全选中某个段落时，focusNode 有可能是下一行的第 0 个位置
  if (startParent.id !== endParent.id && startOffset === 0 && endOffset === 0) {
    for (let i = 0; i < startParent.children.length; i++) {
      const element = startParent.children[i];
      if (element === startContainer) break;
      endOffset += getElememtSize(element);
    }
    endParent = startParent;
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

export {
  flushSelection
};
