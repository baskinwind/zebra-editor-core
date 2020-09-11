// @ts-nocheck
import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getBlockById } from "../components/util";
import { createError } from "../util/handle-error";

export interface cursorType {
  id: string;
  offset: number;
}

let containDocument: Document;
let containWindow: Window;

export const setContainDocument = (doc: Document | null) => {
  if (!doc) throw createError("document 设置失败", undefined, "setting");
  containDocument = doc;
};

export const setContainWindow = (win: Window | null) => {
  if (!win) throw createError("window 设置失败", undefined, "setting");
  containWindow = win;
};

export const getContainDocument = () => containDocument;

export const getContainWindow = () => containWindow;

// 获取光标所在的组件
export const getParent = (
  element: HTMLElement | Node | null | undefined,
): HTMLElement => {
  if (element === null || element === undefined)
    throw createError("获取光标所在节点失败", undefined, "selection");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getParent(element.parentElement);
  }
  if (
    element.dataset &&
    (element.dataset.structure === StructureType.structure ||
      element.dataset.structure === StructureType.content ||
      element.dataset.structure === StructureType.plainText)
  ) {
    return element;
  }
  return getParent(element.parentElement);
};

// 获取光标所在的文本节点
export const getContainer = (
  element: Element | Node | null | undefined,
): HTMLElement => {
  if (element === null || element === undefined)
    throw createError("容器节点获取失败", undefined, "selection");
  // 文本节点处理
  if (
    element.nodeType === 3 ||
    element.nodeName === "IMG" ||
    element.nodeName === "AUDIO" ||
    element.nodeName === "VIDEO"
  ) {
    return getContainer(element.parentElement);
  }

  return element;
};

// 获取元素的长度，修正图片长度为 0 的错误
export const getElememtSize = (element?: Element): number => {
  if (element === undefined) return 0;
  if (
    element.nodeName === "IMG" ||
    element.nodeName === "AUDIO" ||
    element.nodeName === "VIDEO" ||
    element.contentEditable === "true" ||
    (element.dataset && element.dataset.type === ComponentType.inlineImage)
  ) {
    return 1;
  }

  if (element.children && element.children.length) {
    let size = 0;
    for (let i = 0; i < element.children.length; i++) {
      let item = element.children[i];
      size += getElememtSize(item);
    }
    return size;
  }
  return [...element.textContent].length || 0;
};

const findFocusNode = (
  element: Node,
  index: number,
): [boolean, Node, number] => {
  if (
    index === 0 ||
    element.nodeName === "IMG" ||
    element.nodeName === "AUDIO" ||
    element.nodeName === "VIDEO" ||
    element.contentEditable === "true"
  ) {
    if (index <= 1) {
      return [true, element, index];
    }
    return [false, element, 1];
  }

  if (element.children && element.children.length !== 0) {
    let consume = 0;
    for (let i = 0; i < element.children.length; i++) {
      let item = element.children[i];
      let res = findFocusNode(item, index - consume);
      if (res[0]) {
        return res;
      }
      consume += res[2];
    }
    return [false, element, consume];
  }

  let charLength = getElememtSize(element);
  if (index > charLength) {
    return [false, element.childNodes[0], charLength];
  }

  // 兼容 p 标签内的 br 标签
  return [
    true,
    element.childNodes.length ? element.childNodes[0] : element,
    index,
  ];
};

// 将某个组件的某个位置，转换为某个 dom 节点中的某个位置，方便 rang 对象使用
export const getCursorPosition = (
  cursor: cursorType,
): {
  node: Node;
  index: number;
} => {
  let dom = containDocument.getElementById(cursor.id);
  if (!dom) throw createError("该节点已失效", undefined, "selection");
  if (dom.dataset && dom.dataset.type === ComponentType.media) {
    return {
      node: dom.children[0],
      index: cursor.offset === 0 ? 0 : 1,
    };
  }
  let focusInfo = findFocusNode(dom, cursor.offset);
  return {
    node: focusInfo[1],
    index: focusInfo[2],
  };
};

// 获取光标在 parent 中的偏移量
export const getOffset = (
  parent: Element,
  wrap: Element,
  offset: number,
): number => {
  const countSize = (parent, node) => {
    if (parent === node) return 0;
    let size = 0;
    for (let i = 0; i < parent.children.length; i++) {
      let elememt = parent.children[i];
      if (elememt === node) {
        break;
      }
      if (elememt.contains(node)) {
        size += countSize(elememt, node);
        break;
      } else {
        size += getElememtSize(elememt);
      }
    }
    return size;
  };
  return countSize(parent, wrap) + offset;
};

// 获取所有选中的叶节点，不包括结构性的组件
export const getSelectedIdList = (
  startId: string,
  endId: string = startId,
): string[] => {
  if (startId === "") return [];
  if (startId === endId) return [startId];
  let component = getBlockById(startId);
  let parent = component.getParent();
  while (parent.type !== ComponentType.article) {
    parent = parent.getParent();
  }
  return parent.getIdList(startId, endId)[2];
};
