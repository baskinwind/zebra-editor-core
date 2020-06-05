import Article from "../components/article";
import ComponentType from "../const/component-type";
import { getElememtSize, getContainer, cursorType, getParent } from "./util";
import { getComponentById } from "../components/util";

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
      offset: 0
    },
    {
      id: "",
      offset: 0
    }
  ]
};

let flushTimer: any = null;

// 至少隔 300 毫秒后，才能保存当前选取的内容，避免过度触发该 API
const flushSelection = () => {
  if (flushTimer) return;
  getSelection();
  flushTimer = setTimeout(() => {
    flushTimer = null;
  }, 300);
};

// 获得之前选区的内容
const getBeforeSelection = () => {
  return selectionStore;
};

// 获取选区信息，从 range[0].id 组件的 offset 位置开始，到 range[1].id 的 offset 位置结束
const getSelection = () => {
  let root = [...document.querySelectorAll(".zebra-draft-root")];
  let section = window.getSelection();
  // 无选区：直接返回保存的选区内容
  if (
    !section ||
    !section.anchorNode ||
    !section.focusNode ||
    section?.type === "None"
  ) {
    return selectionStore;
  }
  // 光标焦点不在根节点内：直接返回保存的选区内容
  if (!root.some((item) => item.contains(section!.anchorNode)))
    return selectionStore;
  // 光标焦点在 Article 组件
  let anchorNode = section?.anchorNode;
  if (
    anchorNode instanceof HTMLElement &&
    anchorNode.dataset.type === ComponentType.article
  ) {
    // 选中了 Article 组件的直接子节点：返回该直接子节点
    if (section.anchorOffset > 0) {
      let article = getComponentById<Article>("article");
      let child = article.children.get(section.anchorOffset - 1);
      return {
        isCollapsed: true,
        selectStructure: true,
        range: [
          {
            id: child?.id || "",
            offset: section.anchorOffset
          },
          {
            id: child?.id || "",
            offset: section.anchorOffset
          }
        ]
      };
    }
    // 直接返回保存的选区内容
    return selectionStore;
  }
  // 判断开始节点和结束节点的位置关系，
  // 0：同一节点
  // 2：focusNode 在 anchorNode 节点前
  // 4：anchorNode 在 focusNode 节点前
  // 获得选区的开始节点和结束节点（文档顺序）
  let posiType = section.anchorNode.compareDocumentPosition(section.focusNode);
  let anchorOffect = section.anchorOffset;
  let focusOffset = section.focusOffset;
  let startOffset;
  let startNode;
  let endOffset;
  let endNode;
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
  // TODO: 仅发生在选中一个段落时，若有问题，可以查看此处
  if (startParent.id !== endParent.id && startOffset === 0 && endOffset === 0) {
    for (let i = 0; i < startParent.children.length; i++) {
      const element = startParent.children[i];
      if (element === startContainer) break;
      endOffset += getElememtSize(element);
    }
    endParent = startParent;
  }

  // 保存选区信息
  selectionStore = {
    isCollapsed:
      section?.isCollapsed === undefined ? true : section.isCollapsed,
    range: [
      {
        id: startParent.id,
        offset: startOffset
      },
      {
        id: endParent.id,
        offset: endOffset
      }
    ]
  };
  return selectionStore;
};

export default getSelection;

export { flushSelection, getBeforeSelection };
