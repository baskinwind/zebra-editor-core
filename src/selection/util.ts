import ComponentType from "../const/component-type";
import StructureType from "../const/structure-type";
import { getUtf8TextLengthFromJsOffset } from "../util/text-util";
import { createError } from "../util/handle-error";

export interface Cursor {
  id: string;
  offset: number;
}

// 获取光标所在的组件
export const getCursorElement = (element?: HTMLElement | null): HTMLElement => {
  if (!element) throw createError("获取光标所在节点失败", undefined, "selection");
  // 文本节点处理
  if (element.nodeType === 3) {
    return getCursorElement(element.parentElement);
  }

  if (element.dataset && element.dataset.structure === StructureType.structure) {
    return getCursorElement(element.children[0] as HTMLElement);
  }

  if (
    element.dataset &&
    (element.dataset.structure === StructureType.content ||
      element.dataset.structure === StructureType.plainText)
  ) {
    return element;
  }

  return getCursorElement(element.parentElement);
};

// 获取光标所在的文本节点
export const getContainer = (element?: HTMLElement | null): HTMLElement => {
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

  return element as HTMLElement;
};

// 获取元素的长度，修正图片长度为 0 的错误
export const getElememtSize = (element?: HTMLElement): number => {
  if (element === undefined) return 0;

  if (
    element.nodeName === "IMG" ||
    element.nodeName === "AUDIO" ||
    element.nodeName === "VIDEO" ||
    element.contentEditable === "false"
  ) {
    return 1;
  }

  if (element.children && element.children.length) {
    let size = 0;
    for (let i = 0; i < element.children.length; i++) {
      let each = element.children[i] as HTMLElement;
      size += getElememtSize(each);
    }
    return size;
  }

  return getUtf8TextLengthFromJsOffset(element.textContent);
};

const findFocusNode = (element: HTMLElement, index: number): [boolean, Node, number] => {
  if (
    element.nodeName === "IMG" ||
    element.nodeName === "AUDIO" ||
    element.nodeName === "VIDEO" ||
    element.contentEditable === "false"
  ) {
    if (index <= 1) {
      return [true, element, index];
    }

    return [false, element, 1];
  }

  if (element.children && element.children.length !== 0) {
    let consume = 0;

    for (let i = 0; i < element.children.length; i++) {
      let each = element.children[i] as HTMLElement;
      let res = findFocusNode(each, index - consume);
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

  return [true, element.childNodes[0], index];
};

// 将某个组件的某个位置，转换为某个 dom 节点中的某个位置，方便 rang 对象使用
export const getCursorPosition = (
  contentWindow: Window,
  cursor: Cursor,
): {
  node: Node;
  index: number;
} => {
  let dom = contentWindow.document.getElementById(cursor.id);
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
export const getOffset = (parent: HTMLElement, wrap: HTMLElement, offset: number): number => {
  const countSize = (parent: HTMLElement, node: HTMLElement) => {
    if (parent === node) return 0;
    let size = 0;
    for (let i = 0; i < parent.children.length; i++) {
      let each = parent.children[i] as HTMLElement;

      if (each === node) {
        break;
      }

      if (each.contains(node)) {
        size += countSize(each, node);
        break;
      } else {
        size += getElememtSize(each);
      }
    }
    return size;
  };

  return countSize(parent, wrap) + offset;
};
